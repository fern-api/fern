import { DynamicSnippetsTestRunner } from "@fern-api/browser-compatible-base-generator";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

describe("snippets", () => {
    const runner = new DynamicSnippetsTestRunner();
    runner.runTests({
        buildGenerator: ({ irFilepath }) =>
            buildDynamicSnippetsGenerator({ irFilepath, config: buildGeneratorConfig() })
    });
});
