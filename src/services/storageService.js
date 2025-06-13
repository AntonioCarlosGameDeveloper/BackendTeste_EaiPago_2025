const fs = require("fs").promises;
const path = require("path");
const { mkdirp } = require("mkdirp");

class StorageService {
  constructor() {
    this.storagePath = path.join(__dirname, "../../videos");
    this.ensureStorageExists();
  }

  async ensureStorageExists() {
    await mkdirp(this.storagePath);
  }

  async saveFile(filename, buffer) {
    const filePath = path.join(this.storagePath, filename);
    await fs.writeFile(filePath, buffer);
  }

  async getFileStream(filename, range) {
    const filePath = path.join(this.storagePath, filename);

    try {
      await fs.access(filePath);
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;

        const file = fs.createReadStream(filePath, { start, end });
        return {
          stream: file,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Content-Length": chunksize,
          },
          statusCode: 206,
        };
      }

      return {
        stream: fs.createReadStream(filePath),
        headers: { "Content-Length": fileSize },
        statusCode: 200,
      };
    } catch {
      return null;
    }
  }
}

module.exports = new StorageService();
