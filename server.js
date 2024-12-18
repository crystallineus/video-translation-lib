const express = require("express");
const JobStatus = require("./JobStatus.js");

module.exports = {
  startServer: async function startServer(
    port,
    delayMin,
    delayMax,
    success,
    serverError,
    clientError
  ) {
    const app = express();
    const delay = Math.random() * (delayMax - delayMin) + delayMin || 5000;
    console.log("delay", delay);

    let startTime = Date.now();

    app.get("/status", (req, res) => {
      if (clientError) {
        res.status(400).json({ result: "Client error occurred." });
        return;
      }

      if (serverError) {
        res.status(500).json({ result: "Server error occurred." });
        return;
      }

      const diff = Date.now() - startTime;
      console.log("diff", diff);

      if (diff < delay) {
        return res.json({ result: JobStatus.PENDING });
      }

      const status = success ? JobStatus.COMPLETED : JobStatus.ERROR;

      res.json({ result: status });
    });

    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
        console.log(`Configured delay: ${delay} ms`);
        resolve(server);
      });
    });
  },

  stopServer: async function stopServer(server) {
    return new Promise((resolve) => {
      console.log(`Server is closed.`);
      server.close(resolve);
    });
  },
};
