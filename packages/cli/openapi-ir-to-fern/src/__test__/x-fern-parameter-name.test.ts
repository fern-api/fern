import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-parameter-name", () => {
    testConvertOpenAPI("x-fern-parameter-name", "openapi.yml");
});
