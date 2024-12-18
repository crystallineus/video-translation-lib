const axios = require("axios");
const JobStatus = require("./JobStatus");

module.exports = class VideoTranslation {
  constructor(serverUrl, options = {}) {
    this.serverUrl = serverUrl;
    this.maxRetries = options.maxRetries || 5;
    this.initialDelay = options.initialDelay || 500;
  }

  async waitForJobCompletion() {
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        const response = await axios.get(`${this.serverUrl}/status`);

        const status = response.data.result;
        console.log(`Attempt ${attempts}: Status = ${status}`);

        if (status === JobStatus.COMPLETED) {
          return JobStatus.COMPLETED;
        } else if (status === JobStatus.ERROR) {
          throw new Error("Job encountered an error.");
        }
      } catch (error) {
        if (error.response && error.response.status === 500) {
          console.log(
            "Job encountered a server error (http code: 500). Retry."
          );
        } else {
          console.error("Other kind of error", error);
          throw error;
        }
        console.log("done catch");
      }

      console.log("I got here", attempts);

      if (attempts != this.maxRetries - 1) {
        const delay = this._calculateBackoff(attempts);
        console.log(`Retrying after ${delay}ms...`);
        await this._delay(delay);
      }
      attempts++;
      console.log(`attempts: ${attempts}`);
    }

    throw new Error("Max retries reached.");
  }

  _calculateBackoff(attempt) {
    const delay = this.initialDelay * 2 ** attempt;
    return delay;
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
