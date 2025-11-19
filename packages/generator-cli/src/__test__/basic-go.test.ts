import { default as CONFIG } from "./fixtures/basic-go/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("basic-go", () => {
    testGenerateReadme({
        fixtureName: "basic-go",
        config: CONFIG
    });
});
