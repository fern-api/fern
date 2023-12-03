import { testParseOpenAPI } from "./testParseOpenApi";

describe("x-fern-ignore-schema", () => {
    testParseOpenAPI("x-fern-ignore-schema", "openapi.yml");
});
