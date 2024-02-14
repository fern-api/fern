import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("open api parser", () => {
    testConvertOpenAPI("file-upload", "openapi.yml");
});
