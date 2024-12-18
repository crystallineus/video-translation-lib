const VideoTranslation = require("./client");
const { startServer, stopServer } = require("./server");
const JobStatus = require("./JobStatus");

describe("VideoTranslation", () => {
  const maxRetries = 4;
  const initialDelay = 100;

  it("should return COMPLETED if job status is completed", async () => {
    const server = await startServer(3000, 200, 400, true, false, false);
    const serverUrl = "http://localhost:3000";
    const videoTranslation = new VideoTranslation(serverUrl, {
      maxRetries,
      initialDelay,
    });
    const status = await videoTranslation.waitForJobCompletion();
    expect(status).toBe(JobStatus.COMPLETED);

    await stopServer(server);
  });

  it("should return ERROR if job status is error", async () => {
    const server = await startServer(4000, 200, 400, false, false, false);
    const serverUrl = "http://localhost:4000";
    const videoTranslation = new VideoTranslation(serverUrl, {
      maxRetries,
      initialDelay,
    });

    await expect(videoTranslation.waitForJobCompletion()).rejects.toThrow(
      "Job encountered an error."
    );

    await stopServer(server);
  });

  it("should throw an error after max retries", async () => {
    const server = await startServer(6000, 2000, 3000, false, false, false);
    const serverUrl = "http://localhost:6000";
    const videoTranslation = new VideoTranslation(serverUrl, {
      maxRetries,
      initialDelay,
    });

    await expect(videoTranslation.waitForJobCompletion()).rejects.toThrow(
      "Max retries reached."
    );

    await stopServer(server);
  });

  it("should retry if server return 500", async () => {
    const server = await startServer(2000, 200, 400, false, true, false);
    const serverUrl = "http://localhost:2000";
    const videoTranslation = new VideoTranslation(serverUrl, {
      maxRetries,
      initialDelay,
    });

    await expect(videoTranslation.waitForJobCompletion()).rejects.toThrow(
      "Max retries reached."
    );

    await stopServer(server);
  });

  it("should throw error if server return 400", async () => {
    const server = await startServer(2100, 200, 400, false, false, true);
    const serverUrl = "http://localhost:2100";
    const videoTranslation = new VideoTranslation(serverUrl, {
      maxRetries,
      initialDelay,
    });

    await expect(videoTranslation.waitForJobCompletion()).rejects.toThrow(
      "Request failed with status code 400"
    );

    await stopServer(server);
  });
});
