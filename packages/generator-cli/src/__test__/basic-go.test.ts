import { default as CONFIG } from "./fixtures/basic-go/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("basic-go", () => {
    testGenerateReadme({
        fixtureName: "basic-go",
        config: CONFIG
    });
});
