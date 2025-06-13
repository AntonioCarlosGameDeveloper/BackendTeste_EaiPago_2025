const express = require("express");
const videoController = require("./controllers/videoController");
const uploadMiddleware = require("./middlewares/uploadMiddleware");
const cacheMiddleware = require("./middlewares/cacheMiddleware");

const app = express();

app.post("/upload/video", uploadMiddleware, videoController.uploadVideo);
app.get(
  "/static/video/:filename",
  cacheMiddleware,
  videoController.streamVideo
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

module.exports = app;
