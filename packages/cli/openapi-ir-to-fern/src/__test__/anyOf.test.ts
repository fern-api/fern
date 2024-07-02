import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("anyOf", () => {
    testConvertOpenAPI("anyOf", "openapi.yml");
});
