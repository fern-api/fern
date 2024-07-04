import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-token-variable-name", () => {
    testConvertOpenAPI("x-fern-token-variable-name", "openapi.yml");
});
