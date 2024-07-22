import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-version", () => {
    testConvertOpenAPI("x-fern-version", "openapi.yml");
});
