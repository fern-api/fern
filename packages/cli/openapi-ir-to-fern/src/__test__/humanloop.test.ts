import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("open api ir to fern", () => {
    testConvertOpenAPI("humanloop", "openapi.yml");
});
