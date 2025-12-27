const Ftp = require("ftp");
const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  remoteRoot: "/",
};

const localRoot = path.join(__dirname, "..", "out");
const htaccessPath = path.join(__dirname, "..", ".htaccess");

const ftp = new Ftp();

ftp.on("ready", () => {
  console.log("FTP connection ready.");
  uploadDirectory(localRoot, config.remoteRoot);
  console.log("FTP upload complete.");
});

ftp.on("error", (err) => {
  console.error("FTP error:", err);
});

ftp.connect(config);

function uploadDirectory(localPath, remotePath) {
  fs.readdir(localPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${localPath}:`, err);
      return;
    }

    files.forEach((file) => {
      const localFilePath = path.join(localPath, file.name);
      const remoteFilePath = path
        .join(remotePath, file.name)
        .replace(/\\/g, "/");

      if (file.isDirectory()) {
        ftp.mkdir(remoteFilePath, true, (err) => {
          if (err) {
            console.error(
              `Error creating remote directory ${remoteFilePath}:`,
              err
            );
          } else {
            console.log(`Created remote directory: ${remoteFilePath}`);
            uploadDirectory(localFilePath, remoteFilePath);
          }
        });
      } else {
        uploadFile(localFilePath, remoteFilePath);
      }
    });

    if (localPath === localRoot) {
      const remoteHtaccessPath = path
        .join(config.remoteRoot, ".htaccess")
        .replace(/\\/g, "/");
      uploadFile(htaccessPath, remoteHtaccessPath, () => {
        ftp.end();
      });
    }
  });
}

function uploadFile(localFilePath, remoteFilePath, callback) {
  ftp.put(localFilePath, remoteFilePath, (err) => {
    if (err) {
      console.error(
        `Error uploading file ${localFilePath} to ${remoteFilePath}:`,
        err
      );
    } else {
      console.log(`Uploaded file: ${remoteFilePath}`);
    }
    if (callback) {
      callback();
    }
  });
}
