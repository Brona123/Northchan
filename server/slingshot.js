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