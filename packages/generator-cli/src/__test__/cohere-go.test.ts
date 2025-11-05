import { default as CONFIG } from "./fixtures/cohere-go/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("cohere-go", () => {
    testGenerateReadme({
        fixtureName: "cohere-go",
        config: CONFIG
    });
});
