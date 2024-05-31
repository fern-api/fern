import { testConvertOpenAPI } from "./testConvertOpenApi";

describe("x-fern-idempotency-headers", () => {
    testConvertOpenAPI("x-fern-idempotency-headers", "openapi.yml");
});
