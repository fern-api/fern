import { default as CONFIG } from "./fixtures/basic-java/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("basic-java", () => {
    testGenerateReadme({
        fixtureName: "basic-java",
        config: CONFIG
    });
});
