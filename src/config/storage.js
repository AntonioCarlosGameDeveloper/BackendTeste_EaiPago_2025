module.exports = {
  //Pode ser 'local', 'google cloud', etc, aqui eu uso local mesmo
  type: process.env.STORAGE_TYPE || "local",

  //Configuracoes
  local: {
    directory: process.env.STORAGE_LOCAL_DIR || "./videos",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  },

  s3: {
    bucketName: process.env.S3_BUCKET || "video-bucket",
    region: process.env.S3_REGION || "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },

  googleCloud: {
    bucketName: process.env.GCS_BUCKET || "video-bucket",
    keyFilename: process.env.GCS_KEY_FILE || "./service-account.json",
  },

  //Validacao de arquivos
  isValidFileType: function (mimetype) {
    return this[this.type].allowedTypes.includes(mimetype);
  },

  //Validacao tamanho de arquivo
  isValidFileSize: function (size) {
    return size <= this[this.type].maxFileSize;
  },
};
