module.exports = {
    "fern-dev": {
        NEXT_PUBLIC_FDR_ORIGIN: "https://registry-dev.buildwithfern.com",
        NEXT_PUBLIC_POSTHOG_API_KEY: "",
        NEXT_PUBLIC_ALGOLIA_APP_ID: "CQINPZSKS3",
        NEXT_PUBLIC_ALGOLIA_API_KEY: "9515d5b15764da73b5cfad85772779fa",
        NEXT_PUBLIC_DISPLAY_ERRORS: "true",
    },
    "fern-prod": {
        NEXT_PUBLIC_FDR_ORIGIN: "https://registry.buildwithfern.com",
        NEXT_PUBLIC_POSTHOG_API_KEY: "phc_yQgAEdJJkVpI24NdSRID2mor1x1leRpDoC9yZ9mfXal",
        NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
        NEXT_PUBLIC_ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
        NEXT_PUBLIC_DISPLAY_ERRORS: "false",
    },
};
