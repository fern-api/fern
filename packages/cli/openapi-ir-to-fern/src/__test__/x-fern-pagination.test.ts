import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-pagination", () => {
    testConvertOpenAPI("x-fern-pagination", "openapi.yml");
});
