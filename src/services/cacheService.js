const redis = require("redis");
const { promisify } = require("util");

class CacheService {
  constructor() {
    this.client = redis.createClient({
      url: `redis://${process.env.REDIS_HOST || "localhost"}:6379`,
    });
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.client.on("error", console.error);
  }

  async set(key, value) {
    try {
      await this.setexAsync(key, 60, JSON.stringify(value)); //60s
    } catch (err) {
      console.error("Cache set error:", err);
    }
  }

  async get(key) {
    try {
      const data = await this.getAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Cache get error:", err);
      return null;
    }
  }
}

module.exports = new CacheService();
