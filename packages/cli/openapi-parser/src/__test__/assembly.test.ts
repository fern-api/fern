import { testParseOpenAPI } from "./testParseOpenApi";

describe("open api parser", () => {
    testParseOpenAPI("assembly", "openapi.yml", "asyncapi.yml");
});
