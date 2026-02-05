import { default as CONFIG } from "./fixtures/filter-table-of-contents/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("filter table of contents", () => {
    testGenerateReadme({
        fixtureName: "filter-table-of-contents",
        config: CONFIG,
        originalReadme: "README.md"
    });
});
