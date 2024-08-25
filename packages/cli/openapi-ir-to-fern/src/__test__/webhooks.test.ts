import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("webhooks", () => {
    testConvertOpenAPI("webhooks", "openapi.yml");
});
