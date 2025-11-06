import { default as CONFIG } from "./fixtures/remove-generated-sections/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("remove-generated-sections", () => {
    testGenerateReadme({
        fixtureName: "remove-generated-sections",
        config: CONFIG,
        skip: true
    });
});
