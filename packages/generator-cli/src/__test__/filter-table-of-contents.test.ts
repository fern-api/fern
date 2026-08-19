import { default as CONFIG } from "./fixtures/filter-table-of-contents/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("filter table of contents", () => {
    testGenerateReadme({
        fixtureName: "filter-table-of-contents",
        config: CONFIG,
        originalReadme: "README.md"
    });
});
