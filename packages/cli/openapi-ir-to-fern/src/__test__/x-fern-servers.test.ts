import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-servers", () => {
    testConvertOpenAPI("x-fern-servers", "openapi.yml");
});
