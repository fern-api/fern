import { testParseOpenAPI } from "./testParseOpenApi";

describe("open api parser", () => {
    testParseOpenAPI("gen-yml-make-undisc-unions", "openapi.json", undefined, {
        audiences: [],
        shouldUseTitleAsName: true,
        shouldUseUndiscriminatedUnionsWithLiterals: true
    });
});
