import { default as CONFIG } from "./fixtures/empty-java/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("empty-java", () => {
    testGenerateReadme({
        fixtureName: "empty-java",
        config: CONFIG
    });
});
