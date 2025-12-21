import { default as CONFIG } from "./fixtures/mixed-snippets/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("mixed-snippets", () => {
    testGenerateReadme({
        fixtureName: "mixed-snippets",
        config: CONFIG
    });
});
