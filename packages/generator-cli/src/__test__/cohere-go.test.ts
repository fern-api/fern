import { default as CONFIG } from "./fixtures/cohere-go/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("cohere-go", () => {
    testGenerateReadme({
        fixtureName: "cohere-go",
        config: CONFIG
    });
});
