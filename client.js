const axios = require("axios");
const JobStatus = require("./JobStatus");

module.exports = class VideoTranslation {
  constructor(serverUrl, options = {}) {
    this.serverUrl = serverUrl;
    this.maxRetries = options.maxRetries || 5;
    this.initialDelay = options.initialDelay || 500;
    this.maxDelay = options.maxDelay || 5000;
  }

  async getStatus() {
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        const response = await axios.get(`${this.serverUrl}/status`);
        const status = response.data.result;

        console.log(`Attempt ${attempts + 1}: Status = ${status}`);

        if (status === JobStatus.COMPLETED) {
          return JobStatus.COMPLETED;
        } else if (status === JobStatus.ERROR) {
          return JobStatus.ERROR;
        }

        const delay = this._calculateBackoff(attempts);
        console.log(`Retrying after ${delay}ms...`);
        await this._delay(delay);
        attempts++;
        console.log(`attempts: ${attempts}`);
      } catch (error) {
        throw new Error(error);
      }
    }

    throw new Error("Max retries reached.");
  }

  _calculateBackoff(attempt) {
    const delay = Math.min(this.initialDelay * 2 ** attempt, this.maxDelay);
    return delay;
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
