const cacheService = require("../services/cacheService");

module.exports = async (req, res, next) => {
  const { filename } = req.params;

  try {
    const cached = await cacheService.get(filename);
    if (cached) {
      req.cachedVideo = cached;
      return next();
    }
  } catch (err) {
    console.error("Cache middleware error:", err);
  }

  next();
};
