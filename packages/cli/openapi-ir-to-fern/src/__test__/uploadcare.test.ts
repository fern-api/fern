import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("open api parser", () => {
    testConvertOpenAPI("uploadcare", "openapi.json");
});
