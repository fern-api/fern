import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-enum", () => {
    testConvertOpenAPI("x-fern-enum", "openapi.yml");
});
