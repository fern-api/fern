import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-oauth", () => {
    testConvertOpenAPI("x-fern-oauth", "openapi.yml");
});
