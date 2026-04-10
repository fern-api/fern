import { default as CONFIG } from "./fixtures/empty-go/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("empty-go", () => {
    testGenerateReadme({
        fixtureName: "empty-go",
        config: CONFIG
    });
});
