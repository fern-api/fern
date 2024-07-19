import { testParseOpenAPI } from "./testParseOpenApi";

describe("non alphanumeric characters", () => {
    testParseOpenAPI("non-alphanumeric-characters", "openapi.yml");
});
