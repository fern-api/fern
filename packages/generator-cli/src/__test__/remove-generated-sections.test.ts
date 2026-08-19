import { default as CONFIG } from "./fixtures/remove-generated-sections/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("remove-generated-sections", () => {
    testGenerateReadme({
        fixtureName: "remove-generated-sections",
        config: CONFIG,
        skip: true
    });
});
