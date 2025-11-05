import { default as CONFIG } from "./fixtures/basic-swift/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("basic-swift", () => {
    testGenerateReadme({
        fixtureName: "basic-swift",
        config: CONFIG
    });
});
