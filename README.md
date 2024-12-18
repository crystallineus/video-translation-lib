# Video Translation Library

This library provides a simple interface to check the status of a video translation task by communicating with a simulated backend server. It handles retries with exponential backoff.

## **Repository Overview**

This repository contains:

1. **`server.js`**: A simulated server backend that returns the job status (`pending`, `completed`, `error`).
2. **`client.js`**: A client library for interacting with the server.
3. **`test.js`**: Integration tests for the client library and server.

## **Prerequisites**

1. **Node.js Installed**: Ensure you have Node.js (v14 or later) installed.
2. **Dependencies Installed**: Run the following command to install required dependencies:
   ```bash
   npm install
   ```

## **Client Library**

The client library (`client.js`) provides a high level API for interacting
with the video translation service.

#### **Example Usage**

```javascript
const VideoTranslation = require("./client.js");

(async () => {
  // First, start by instantiating the VideoTranslation class.
  // This object provides all the methods for interacting with the video translation service.
  const client = new VideoTranslation();

  try {
    // After starting your translation job, you can
    // call waitForJobCompletion() to wait for it to complete.
    await client.waitForJobCompletion();
    console.log(`Job is complete, do remaining work.`);
  } catch (error) {
    // If the job fails, takes too long, or any other issue occurs, the method will throw an error.
    console.error(`${error.message}`);
  }
})();
```

#### Advanced Usage

```javascript
const VideoTranslation = require("./client.js");

async () => {
  // You can optionally provide a custom server URL when instantiating
  // the VideoTranslation class.
  const serverUrl = "http://localhost:3001";
  const client = new VideoTranslation(serverUrl);

  // Most users should be fine with the defaults for waitForJobCompletion,
  // but you can optionally customize the retry policy.
  const options = {
    maxRetries: 50,
    initialDelay: 1000,
  };
  await client.waitForJobCompletion(options);
};
```

#### **waitForJobCompletion options**

| **Option**     | **Type** | **Default** | **Description**                            |
| -------------- | -------- | ----------- | ------------------------------------------ |
| `maxRetries`   | Number   | `5`         | Maximum number of retries for the request. |
| `initialDelay` | Number   | `500`       | Initial delay between retries (in ms).     |

## **Testing**

The repository includes integration tests (`test.js`) for the client library and server using Jest.

Run tests using:

```bash
npm test
```

## Assumptions

In the real world, there would probably be an endpoint
for starting the translation job, and the status endpoint would take a job ID. For this project we have simplified it.

The default retry policy for waitForCompletion should be based on how long jobs typically take. I have picked arbitrary numbers for this project.
