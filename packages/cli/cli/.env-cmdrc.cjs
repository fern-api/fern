module.exports = {
    prod: {
        AUTH0_DOMAIN: "fern-prod.us.auth0.com",
        AUTH0_CLIENT_ID: "syaWnk6SjNoo5xBf1omfvziU3q7085lh",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator.buildwithfern.com",
        DEFAULT_VENUS_ORIGIN: "https://venus.buildwithfern.com",
        DEFAULT_FDR_ORIGIN: "https://registry.buildwithfern.com",
        VENUS_AUDIENCE: "venus-prod",
        LOCAL_STORAGE_FOLDER: ".fern",
        POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
        DOCS_DOMAIN_SUFFIX: "docs.buildwithfern.com",
        DOCS_PREVIEW_BUCKET: 'https://prod-local-preview-bundle2.s3.amazonaws.com/'
    },
    dev: {
        AUTH0_DOMAIN: "fern-dev.us.auth0.com",
        AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator-dev2.buildwithfern.com",
        DEFAULT_VENUS_ORIGIN: "https://venus-dev2.buildwithfern.com",
        DEFAULT_FDR_ORIGIN: "https://registry-dev2.buildwithfern.com",
        VENUS_AUDIENCE: "venus-dev",
        LOCAL_STORAGE_FOLDER: ".fern-dev",
        POSTHOG_API_KEY: null,
        DOCS_DOMAIN_SUFFIX: "dev.docs.buildwithfern.com",
        DOCS_PREVIEW_BUCKET: 'https://dev2-local-preview-bundle2.s3.amazonaws.com/'
    },
    local: {
        AUTH0_DOMAIN: "fern-dev.us.auth0.com",
        AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator-dev2.buildwithfern.com",
        DEFAULT_VENUS_ORIGIN: "https://venus-dev2.buildwithfern.com",
        DEFAULT_FDR_ORIGIN: "http://localhost:8080",
        VENUS_AUDIENCE: "venus-dev",
        LOCAL_STORAGE_FOLDER: ".fern-local",
        POSTHOG_API_KEY: null,
        DOCS_DOMAIN_SUFFIX: "dev.docs.buildwithfern.com",
        DOCS_PREVIEW_BUCKET: 'https://dev2-local-preview-bundle2.s3.amazonaws.com/'
    },
};
