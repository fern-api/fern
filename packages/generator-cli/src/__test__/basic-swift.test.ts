import { default as CONFIG } from "./fixtures/basic-swift/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("basic-swift", () => {
    testGenerateReadme({
        fixtureName: "basic-swift",
        config: CONFIG
    });
});
