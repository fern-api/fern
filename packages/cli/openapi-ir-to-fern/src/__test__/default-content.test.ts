import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("open api ir to fern", () => {
    testConvertOpenAPI("default-content", "openapi.yml");
});
