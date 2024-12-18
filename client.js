const axios = require("axios");
const JobStatus = require("./JobStatus");

// VideoTranslation is a client SDK for interacting with the video translation
// server
module.exports = class VideoTranslation {
  constructor(serverUrl = "http://localhost:3000") {
    this.serverUrl = serverUrl;
  }

  // waitForJobCompletion returns JobStatus.COMPLETED once the job completes successfully.
  // If the job fails or the maximum number of retries is reached, it throws an error.
  // `options` can optionally be provided to customize the retry policy. The defaults
  // should work for most use cases.
  async waitForJobCompletion(options = {}) {
    const maxRetries = options.maxRetries || 5;
    const initialDelay = options.initialDelay || 500;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const response = await axios.get(`${this.serverUrl}/status`);
        const status = response.data.result;
        console.log(`client: attempt ${attempts}: Status = ${status}`);

        if (status === JobStatus.COMPLETED) {
          return JobStatus.COMPLETED;
        } else if (status === JobStatus.ERROR) {
          throw new Error("Job failed");
        }
      } catch (error) {
        if (error.response && error.response.status === 500) {
          console.log(
            "client: job encountered a server error (http code: 500). Retrying."
          );
        } else {
          throw error;
        }
      }

      if (attempts != this.maxRetries - 1) {
        const delay = this._calculateBackoff(initialDelay, attempts);
        console.log(`client: sleeping for ${delay}ms...`);
        await this._sleep(delay);
      }
      attempts++;
    }

    throw new Error("Max retries reached.");
  }

  _calculateBackoff(initialDelay, attempt) {
    const delay = initialDelay * 2 ** attempt;
    return delay;
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
