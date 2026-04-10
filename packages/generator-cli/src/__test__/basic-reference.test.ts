import { default as CONFIG } from "./fixtures/basic-reference/reference.js";
import { testGenerateReference } from "./testGenerateReference.js";

describe("basic-reference", () => {
    testGenerateReference({
        fixtureName: "basic-reference",
        config: CONFIG
    });
});
