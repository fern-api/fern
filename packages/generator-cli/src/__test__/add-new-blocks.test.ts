import { default as CONFIG } from "./fixtures/add-new-blocks/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("add new blocks", () => {
    testGenerateReadme({
        fixtureName: "add-new-blocks",
        config: CONFIG,
        originalReadme: "README.md"
    });
});
