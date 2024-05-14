import { testParseOpenAPI } from "./testParseOpenApi";

describe("open api parser", () => {
    testParseOpenAPI("undiscriminated-enums", "openapi.yml");
});
