import { default as CONFIG } from "./fixtures/remove-disabled-sections/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("remove-disabled-sections", () => {
    testGenerateReadme({
        fixtureName: "remove-disabled-sections",
        config: CONFIG,
        originalReadme: "README.md"
    });
});
