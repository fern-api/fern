import { default as CONFIG } from "./fixtures/empty-java/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("empty-java", () => {
    testGenerateReadme({
        fixtureName: "empty-java",
        config: CONFIG
    });
});
