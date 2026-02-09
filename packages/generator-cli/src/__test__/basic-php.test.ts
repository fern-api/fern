import { default as CONFIG } from "./fixtures/basic-php/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("basic-php", () => {
    testGenerateReadme({
        fixtureName: "basic-php",
        config: CONFIG
    });
});
