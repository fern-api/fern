import { default as CONFIG } from "./fixtures/basic-rust/readme";
import { testGenerateReadme } from "./testGenerateReadme";

describe("basic-rust", () => {
    testGenerateReadme({
        fixtureName: "foxglove/foxglove-rust-sdk",
        config: CONFIG
    });
});
