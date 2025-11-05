import { default as CONFIG } from "./fixtures/remove-disabled-sections/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("remove-disabled-sections", () => {
    testGenerateReadme({
        fixtureName: "remove-disabled-sections",
        config: CONFIG,
        originalReadme: "README.md"
    });
});
