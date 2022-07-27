const packageJson = require("./package.json");

module.exports = {
    prod: {
        AUTH0_DOMAIN: "fern-dev.us.auth0.com",
        AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
        PACKAGE_VERSION: packageJson.version,
    },
    dev: {
        AUTH0_DOMAIN: "fern-dev.us.auth0.com",
        AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
        PACKAGE_VERSION: packageJson.version,
    },
};
