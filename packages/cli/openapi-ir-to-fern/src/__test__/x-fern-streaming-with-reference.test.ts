import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-streaming-with-reference", () => {
    testConvertOpenAPI("x-fern-streaming-with-reference", "openapi.yml");
});
