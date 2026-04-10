import { default as CONFIG } from "./fixtures/advanced/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("advanced", () => {
    testGenerateReadme({
        fixtureName: "advanced",
        config: CONFIG
    });
});
