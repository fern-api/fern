import { testParseOpenAPI } from "./testParseOpenApi";

describe("query-parameters", () => {
    testParseOpenAPI("query-parameters", "openapi.yml");
});
