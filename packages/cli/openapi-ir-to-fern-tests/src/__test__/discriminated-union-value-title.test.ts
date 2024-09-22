import { testConvertOpenAPI } from "../testConvertOpenApi";

describe("openapi parser", () => {
    testConvertOpenAPI("discriminated-union-value-title", "openapi.yml");
});
