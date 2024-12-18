const express = require("express");
const dotenv = require("dotenv");
const JobStatus = require("./JobStatus.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DELAY = parseInt(process.env.DELAY, 10) || 5000;

let startTime = Date.now();

app.get("/status", (req, res) => {
  const diff = Date.now() - startTime;

  if (diff < DELAY) {
    return res.json({ result: JobStatus.PENDING });
  }

  // Randomly simulate success or error, e.g. 80% chance of success
  const isSuccess = Math.random() > 0.2;
  const status = isSuccess ? JobStatus.COMPLETED : JobStatus.ERROR;

  res.json({ result: status });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Configured delay: ${DELAY} ms`);
});
