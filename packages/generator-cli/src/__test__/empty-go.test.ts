import { default as CONFIG } from "./fixtures/empty-go/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("empty-go", () => {
    testGenerateReadme({
        fixtureName: "empty-go",
        config: CONFIG
    });
});
