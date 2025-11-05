import { default as CONFIG } from "./fixtures/basic-php/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("basic-php", () => {
    testGenerateReadme({
        fixtureName: "basic-php",
        config: CONFIG
    });
});
