import { default as CONFIG } from "./fixtures/basic-reference/reference";
import { testGenerateReference } from "./testGenerateReference";

describe("basic-reference", () => {
    testGenerateReference({
        fixtureName: "basic-reference",
        config: CONFIG
    });
});
