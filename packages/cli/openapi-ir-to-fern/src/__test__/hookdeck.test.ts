import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("open api parser", () => {
    testConvertOpenAPI("hookdeck", "openapi.yml");
});
