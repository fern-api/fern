import { default as CONFIG } from "./fixtures/add-new-blocks/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("add new blocks", () => {
    testGenerateReadme({
        fixtureName: "add-new-blocks",
        config: CONFIG,
        originalReadme: "README.md"
    });
});
