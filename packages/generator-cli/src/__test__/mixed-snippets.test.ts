import { default as CONFIG } from "./fixtures/mixed-snippets/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("mixed-snippets", () => {
    testGenerateReadme({
        fixtureName: "mixed-snippets",
        config: CONFIG
    });
});
