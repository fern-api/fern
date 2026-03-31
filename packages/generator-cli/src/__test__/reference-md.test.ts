import { default as CONFIG } from "./fixtures/reference-md/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("reference-md", () => {
    testGenerateReadme({
        fixtureName: "reference-md",
        config: CONFIG
    });
});
