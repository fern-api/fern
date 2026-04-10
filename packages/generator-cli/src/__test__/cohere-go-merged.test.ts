import { default as CONFIG } from "./fixtures/cohere-go-merged/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("cohere-go-merged", () => {
    testGenerateReadme({
        fixtureName: "cohere-go-merged",
        config: CONFIG,
        originalReadme: "README.md"
    });
});
