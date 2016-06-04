Slingshot.fileRestrictions("fileUploads", {
  	allowedFileTypes: ["image/png"
  						, "image/jpeg"
  						, "image/gif"
  						, "audio/mp3"
  						, "video/mpeg"
  						, "video/mp4"],
  	maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited).
});

Slingshot.createDirective("fileUploads", Slingshot.S3Storage, {
    bucket: "files.northchan.com",

    acl: "public-read",

    authorize: function () {
        return true;
    },

    key: function (file) {
        return `files/${file.name}`;
    }
});