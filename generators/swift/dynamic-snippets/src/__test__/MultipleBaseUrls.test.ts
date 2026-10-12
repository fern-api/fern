import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const IR_FILEPATH = AbsoluteFilePath.of(
    join(
        AbsoluteFilePath.of(
            `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
        ),
        "multi-url-environment.json"
    )
);

const bootInstance: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: { method: "POST", path: "/ec2/boot" },
    baseURL: undefined,
    environment: undefined,
    auth: { type: "bearer", token: "<token>" },
    pathParameters: undefined,
    queryParameters: undefined,
    headers: undefined,
    requestBody: { size: "small" }
};

describe("multiple base URLs", () => {
    const generator = buildDynamicSnippetsGenerator({ irFilepath: IR_FILEPATH, config: buildGeneratorConfig() });

    it("passes a custom baseURL to the root client", async () => {
        const response = await generator.generate({ ...bootInstance, baseURL: "http://localhost:8080" });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain('baseURL: "http://localhost:8080"');
    });

    it("falls back to the default environment's first base URL", async () => {
        const response = await generator.generate(bootInstance);

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain('baseURL: "https://ec2.aws.com"');
    });

    it("uses the requested environment's first base URL", async () => {
        const response = await generator.generate({ ...bootInstance, environment: "Staging" });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain('baseURL: "https://staging.ec2.aws.com"');
    });
});
