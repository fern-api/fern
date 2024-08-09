import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-access-token-endpoint", () => {
    testConvertOpenAPI("x-fern-access-token-endpoint", "openapi.yml");
});
