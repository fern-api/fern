import { default as CONFIG } from "./fixtures/advanced/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("advanced", () => {
    testGenerateReadme({
        fixtureName: "advanced",
        config: CONFIG
    });
});
