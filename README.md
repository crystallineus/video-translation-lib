# Video Translation Library

This library provides a simple interface to check the status of a video translation task by communicating with a simulated backend server. It handles retries with exponential backoff.

## **Repository Overview**

This repository contains:

1. **`server.js`**: A simulated server backend that returns the job status (`PENDING`, `COMPLETED`, `ERROR`).
2. **`client.js`**: A client library to query the server and manage retries.
3. **`test.js`**: Unit tests for the client library using a mock server.

## **Prerequisites**

1. **Node.js Installed**: Ensure you have Node.js (v14 or later) installed.
2. **Dependencies Installed**: Run the following command to install required dependencies:
   ```bash
   npm install
   ```

## **Server Setup**

The server simulates a video translation backend. Start the server using:

```bash
node server.js
```

- The server listens on `http://localhost:3000` by default.
- To customize delay and port, you can create a `.env` file:
  ```dotenv
  PORT=3000
  DELAY=5000
  ```

#### **Endpoint: GET /status**

The server returns the job status:

- **Response Format**:
  ```json
  {
    "result": "PENDING" | "COMPLETED" | "ERROR"
  }
  ```
- The server initially responds with `"PENDING"` until the configured delay is reached. After that, it randomly responds with `"COMPLETED"` (80%) or `"ERROR"` (20%).

## **Client Library**

The client library (`client.js`) allows you to query the server and get the final job status.

#### **Example Usage**

```javascript
const VideoTranslation = require("./client.js");

(async () => {
  const serverUrl = "http://localhost:3000";
  const options = {
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 5000,
  };

  const client = new VideoTranslation(serverUrl, options);

  try {
    const status = await client.getStatus();
    console.log(`Get the job status: ${status}`);
  } catch (error) {
    console.error(`${error.message}`);
  }
})();
```

#### **Configuration Options**

| **Option**     | **Type** | **Default** | **Description**                            |
| -------------- | -------- | ----------- | ------------------------------------------ |
| `maxRetries`   | Number   | `5`         | Maximum number of retries for the request. |
| `initialDelay` | Number   | `500`       | Initial delay between retries (in ms).     |
| `maxDelay`     | Number   | `5000`      | Maximum delay between retries (in ms).     |

#### **Return Values**

- **`PENDING`**: The job is still working.
- **`COMPLETED`**: The job completed successfully.
- **`ERROR`**: The job encountered an error.
- Throws an error if:
  - The server fails to respond.
  - Maximum retries are exceeded.

## **Testing**

The repository includes unit tests (`test.js`) for the client library using Jest and Nock. The tests verify:

1. Successful retrieval of job status.
2. Proper handling of retry logic.
3. Error handling for network/server failures.

Run tests using:

```bash
npm test
```
