module.exports = {
    prod: {
        AUTH0_DOMAIN: "fern-prod.us.auth0.com",
        AUTH0_CLIENT_ID: "syaWnk6SjNoo5xBf1omfvziU3q7085lh",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator.buildwithfern.com",
        VENUS_AUDIENCE: "venus-prod",
        LOCAL_STORAGE_FOLDER: ".fern",
    },
    dev: {
        AUTH0_DOMAIN: "fern-dev.us.auth0.com",
        AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator-dev.buildwithfern.com",
        VENUS_AUDIENCE: "venus-dev",
        LOCAL_STORAGE_FOLDER: ".fern-dev",
    },
};
