import { generatorsYml } from "@fern-api/configuration";
import { testParseOpenAPI } from "./testParseOpenApi";

describe("open api parser", () => {
    testParseOpenAPI(
        "gen-yml-make-undisc-unions",
        "openapi.json",
        undefined,
        true,
        true,
        generatorsYml.GenerationLanguage.PYTHON
    );
});
