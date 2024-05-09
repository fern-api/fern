import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-base-path", () => {
    testConvertOpenAPI("x-fern-base-path", "openapi.yml");
    testConvertOpenAPI("x-fern-base-path", "swagger.yml");
});
