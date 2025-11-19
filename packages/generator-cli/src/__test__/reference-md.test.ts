import { default as CONFIG } from "./fixtures/reference-md/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("reference-md", () => {
    testGenerateReadme({
        fixtureName: "reference-md",
        config: CONFIG
    });
});
