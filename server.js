const express = require("express");
const JobStatus = require("./JobStatus.js");

module.exports = {
  // startServer starts an express HTTP server listening on the specified port
  // for handling video translation requests
  startServer: async function startServer(
    port,
    // options: { delayMax, delayMin, success, serverError, clientError}
    options
  ) {
    const app = express();
    const delayMin = options.delayMin;
    const delayMax = options.delayMax;
    const delay = Math.random() * (delayMax - delayMin) + delayMin;
    console.log(`server: random delay is ${delay}ms`);
    let startTime = Date.now();

    // GET /status returns { status: "pending" } if the job is pending,
    // { status: "completed" } if the job is completed or
    // { status: "error" } if the job has failed.
    app.get("/status", (req, res) => {
      if (options.clientError) {
        res.status(400).json({ reason: "Client error occurred." });
        return;
      }

      if (options.serverError) {
        res.status(500).json({ reason: "Server error occurred." });
        return;
      }

      const diff = Date.now() - startTime;
      console.log(`server: elapsed ${diff}ms`);
      if (diff < delay) {
        return res.json({ result: JobStatus.PENDING });
      }

      const status = options.success ? JobStatus.COMPLETED : JobStatus.ERROR;
      res.json({ result: status });
    });

    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        console.log(`server: listening on http://localhost:${port}`);
        resolve(server);
      });
    });
  },

  // stopServer stops the HTTP server
  stopServer: async function stopServer(server) {
    return new Promise((resolve) => {
      console.log(`server: closed`);
      server.close(resolve);
    });
  },
};
