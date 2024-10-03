import { testConvertOpenAPI } from "../testConvertOpenApi";

describe("x-fern-auth-variables", () => {
    testConvertOpenAPI("x-fern-auth-variables", "openapi.yml");
});
