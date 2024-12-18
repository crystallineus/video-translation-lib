const nock = require("nock");
const VideoTranslation = require("./client");
const JobStatus = require("./JobStatus");

describe("VideoTranslation", () => {
  const serverUrl = "http://localhost:3000";
  const maxRetries = 3;
  const initialDelay = 100;
  const maxDelay = 500;

  let videoTranslation;

  beforeEach(() => {
    videoTranslation = new VideoTranslation(serverUrl, {
      maxRetries,
      initialDelay,
      maxDelay,
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should return COMPLETED if job status is completed", async () => {
    nock(serverUrl).get("/status").reply(200, { result: JobStatus.COMPLETED });

    const status = await videoTranslation.getStatus();
    expect(status).toBe(JobStatus.COMPLETED);
  });

  it("should return ERROR if job status is error", async () => {
    nock(serverUrl).get("/status").reply(200, { result: JobStatus.ERROR });

    const status = await videoTranslation.getStatus();
    expect(status).toBe(JobStatus.ERROR);
  });

  it("should retry and succeed when status changes to COMPLETED", async () => {
    let callCount = 0;

    nock(serverUrl)
      .get("/status")
      .times(2)
      .reply(() => {
        callCount++;
        if (callCount === 1) {
          return [200, { result: JobStatus.PENDING }];
        }
        return [200, { result: JobStatus.COMPLETED }];
      });

    const status = await videoTranslation.getStatus();
    expect(status).toBe(JobStatus.COMPLETED);
  });

  it("should throw an error after max retries", async () => {
    nock(serverUrl)
      .get("/status")
      .times(maxRetries)
      .reply(200, { result: JobStatus.PENDING });

    await expect(videoTranslation.getStatus()).rejects.toThrow(
      "Max retries reached."
    );
  });

  it("should throw an error if the server returns a network error", async () => {
    nock(serverUrl).get("/status").replyWithError("Network error");

    await expect(videoTranslation.getStatus()).rejects.toThrow("Network error");
  });
});
