import { DynamicSnippetsTestRunner } from "@fern-api/browser-compatible-base-generator";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

describe("snippets (default)", () => {
    const runner = new DynamicSnippetsTestRunner();
    runner.runTests({
        buildGenerator: ({ irFilepath }) =>
            buildDynamicSnippetsGenerator({ irFilepath, config: buildGeneratorConfig() })
    });
});

describe("snippets (exportedClientName)", () => {
    const runner = new DynamicSnippetsTestRunner();
    runner.runTests({
        buildGenerator: ({ irFilepath }) =>
            buildDynamicSnippetsGenerator({
                irFilepath,
                config: buildGeneratorConfig({ customConfig: { exportedClientName: "FernClient" } })
            })
    });
});

describe("snippets (exportAllRequestsAtRoot)", () => {
    const runner = new DynamicSnippetsTestRunner();
    runner.runTests({
        buildGenerator: ({ irFilepath }) =>
            buildDynamicSnippetsGenerator({
                irFilepath,
                config: buildGeneratorConfig({ customConfig: { exportAllRequestsAtRoot: true } })
            })
    });
});
