import { default as CONFIG } from "./fixtures/basic-rust/readme.js";
import { testGenerateReadme } from "./testGenerateReadme.js";

describe("basic-rust", () => {
    testGenerateReadme({
        fixtureName: "foxglove/foxglove-rust-sdk",
        config: CONFIG
    });
});
