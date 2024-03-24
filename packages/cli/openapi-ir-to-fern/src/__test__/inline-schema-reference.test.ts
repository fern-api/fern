import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("open api parser", () => {
    testConvertOpenAPI("inline-schema-reference", "openapi.yml");
});
