import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-property-name", () => {
    testConvertOpenAPI("x-fern-property-name", "openapi.yml");
});
