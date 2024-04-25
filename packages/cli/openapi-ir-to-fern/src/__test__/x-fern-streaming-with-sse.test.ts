import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-streaming-with-sse", () => {
    testConvertOpenAPI("x-fern-streaming-with-sse", "openapi.yml");
});
