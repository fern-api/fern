import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("open api parser", () => {
    testConvertOpenAPI("belvo", "openapi.yml");
});
