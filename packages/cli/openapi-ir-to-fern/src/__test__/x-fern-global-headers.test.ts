import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-global-headers", () => {
    testConvertOpenAPI("x-fern-global-headers", "openapi.yml");

    testConvertOpenAPI("x-fern-global-headers", "openapi.yml", {
        globalHeaderOverrides: {
            headers: {
                "X-Global-Test": "string"
            }
        }
    });
});
