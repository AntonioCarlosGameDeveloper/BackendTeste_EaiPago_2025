const cacheService = require("../services/cacheService");
const storageService = require("../services/storageService");

module.exports = {
  async uploadVideo(req, res) {
    try {
      const { buffer, originalname, mimetype } = req.file;
      const filename = `${Date.now()}-${originalname}`;

      //Primeira estrategia do cache
      await cacheService.set(filename, { buffer, mimetype });

      //Aqui temos persistencia assincrona
      storageService.saveFile(filename, buffer).catch(console.error);

      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  },

  async streamVideo(req, res) {
    try {
      const { filename } = req.params;
      const range = req.headers.range;

      //Tenta obter o cache
      const cached = await cacheService.get(filename);

      if (cached) {
        if (range) {
          const fileSize = cached.buffer.length;
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunk = cached.buffer.slice(start, end + 1);

          res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Content-Length": chunk.length,
            "Content-Type": cached.mimetype,
          });
          return res.end(chunk);
        }

        res.writeHead(200, {
          "Content-Length": cached.buffer.length,
          "Content-Type": cached.mimetype,
        });
        return res.end(cached.buffer);
      }

      //Caso nao encontre no cache -> Busca no storage
      const fileData = await storageService.getFileStream(filename, range);

      if (!fileData) {
        return res.status(404).json({ error: "File not found" });
      }

      res.writeHead(fileData.statusCode, {
        ...fileData.headers,
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
      });

      fileData.stream.pipe(res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Streaming failed" });
    }
  },
};
