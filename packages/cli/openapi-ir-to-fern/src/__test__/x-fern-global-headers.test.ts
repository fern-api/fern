import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-global-headers", () => {
    testConvertOpenAPI("x-fern-global-headers", "openapi.yml");
});
