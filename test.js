const VideoTranslation = require("./client");
const { startServer, stopServer } = require("./server");
const JobStatus = require("./JobStatus");

describe("VideoTranslation", () => {
  const waitForJobCompletionOpts = {
    maxRetries: 4,
    initialDelay: 100,
  };

  it("should return done if job status is completed", async () => {
    const server = await startServer(3000, {
      delayMin: 200,
      delayMax: 400,
      success: true,
      serverError: false,
      clientError: false,
    });
    const serverUrl = "http://localhost:3000";
    const videoTranslation = new VideoTranslation(serverUrl);

    const got = await videoTranslation.waitForJobCompletion(
      waitForJobCompletionOpts
    );
    expect(got).toBe(JobStatus.COMPLETED);

    await stopServer(server);
  });

  it("should throw an error if job status is error", async () => {
    const server = await startServer(4000, {
      delayMin: 200,
      delayMax: 400,
      success: false,
      serverError: false,
      clientError: false,
    });
    const serverUrl = "http://localhost:4000";
    const videoTranslation = new VideoTranslation(serverUrl);

    await expect(
      videoTranslation.waitForJobCompletion(waitForJobCompletionOpts)
    ).rejects.toThrow("Job failed");

    await stopServer(server);
  });

  it("should throw an error after max retries", async () => {
    const server = await startServer(6000, {
      delayMin: 2000,
      delayMax: 3000,
      success: false,
      serverError: false,
      clientError: false,
    });
    const serverUrl = "http://localhost:6000";
    const videoTranslation = new VideoTranslation(serverUrl);

    await expect(
      videoTranslation.waitForJobCompletion(waitForJobCompletionOpts)
    ).rejects.toThrow("Max retries reached.");

    await stopServer(server);
  });

  it("should keep trying if server returns 500", async () => {
    const server = await startServer(2000, {
      delayMin: 200,
      delayMax: 400,
      success: false,
      serverError: true,
      clientError: false,
    });
    const serverUrl = "http://localhost:2000";
    const videoTranslation = new VideoTranslation(serverUrl);

    await expect(
      videoTranslation.waitForJobCompletion(waitForJobCompletionOpts)
    ).rejects.toThrow("Max retries reached.");

    await stopServer(server);
  });

  it("should throw error if server return 400", async () => {
    const server = await startServer(2100, {
      delayMin: 200,
      delayMax: 400,
      success: false,
      serverError: false,
      clientError: true,
    });
    const serverUrl = "http://localhost:2100";
    const videoTranslation = new VideoTranslation(serverUrl);

    await expect(
      videoTranslation.waitForJobCompletion(waitForJobCompletionOpts)
    ).rejects.toThrow("Request failed with status code 400");

    await stopServer(server);
  });
});
