import { default as CONFIG } from "./fixtures/basic-java/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("basic-java", () => {
    testGenerateReadme({
        fixtureName: "basic-java",
        config: CONFIG
    });
});
