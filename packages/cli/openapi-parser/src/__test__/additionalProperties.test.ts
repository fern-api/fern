import { testParseOpenAPI } from "./testParseOpenApi";

describe("anyOf", () => {
    testParseOpenAPI("additional-properties", "openapi.yml", undefined, {
        audiences: [],
        shouldUseTitleAsName: true,
        shouldUseUndiscriminatedUnionsWithLiterals: true,
        optionalAdditionalProperties: false,
        cooerceEnumsToLiterals: true
    });
});
