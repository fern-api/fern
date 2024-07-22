import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("non alphanumeric characters", () => {
    testConvertOpenAPI("non-alphanumeric-characters", "openapi.yml");
});
