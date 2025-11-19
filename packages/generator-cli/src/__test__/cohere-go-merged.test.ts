import { default as CONFIG } from "./fixtures/cohere-go-merged/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("cohere-go-merged", () => {
    testGenerateReadme({
        fixtureName: "cohere-go-merged",
        config: CONFIG,
        originalReadme: "README.md"
    });
});
