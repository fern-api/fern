const packageJson = require("./package.json");

module.exports = {
    prod: {
        AUTH0_DOMAIN: "fern-dev.us.auth0.com",
        AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
        PACKAGE_VERSION: packageJson.version,
        PACKAGE_NAME: "fern-api",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator.buildwithfern.com",
        CLI_NAME: "fern",
    },
    dev: {
        AUTH0_DOMAIN: "fern-dev.us.auth0.com",
        AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
        PACKAGE_VERSION: packageJson.version,
        PACKAGE_NAME: "@fern-api/fern-api-dev",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator-dev.buildwithfern.com",
        CLI_NAME: "fern-dev",
    },
};
