import { testParseOpenAPI } from "./testParseOpenApi";

describe("open api parser", () => {
    testParseOpenAPI("webhooks", "openapi.yml");
});
