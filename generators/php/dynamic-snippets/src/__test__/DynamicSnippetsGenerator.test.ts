import { DynamicSnippetsTestRunner } from "@fern-api/browser-compatible-base-generator";
import { AbsoluteFilePath } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

describe("snippets (default)", () => {
    const runner = new DynamicSnippetsTestRunner();
    runner.runTests({
        buildGenerator: ({ irFilepath }) =>
            buildDynamicSnippetsGenerator({ irFilepath, config: buildGeneratorConfig() })
    });
});

describe("snippets (missing auth placeholders)", () => {
    it("bearer auth with no auth in request", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/examples.json`),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/metadata"
            },
            baseURL: undefined,
            environment: undefined,
            auth: undefined,
            pathParameters: undefined,
            queryParameters: {
                shallow: false,
                tag: "development"
            },
            headers: {
                "X-API-Version": "0.0.1"
            },
            requestBody: undefined
        });
        expect(response.snippet).toContain("YOUR_TOKEN");
        expect(response.snippet).toMatchSnapshot();
    });

    it("oauth auth with no auth in request", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/oauth-client-credentials-default.json`
            ),
            config: buildGeneratorConfig({ customConfig: { namespace: "Seed" } })
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/get-something"
            },
            baseURL: "https://api.fern.com",
            environment: undefined,
            auth: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.snippet).toContain("YOUR_CLIENT_ID");
        expect(response.snippet).toContain("YOUR_CLIENT_SECRET");
        expect(response.snippet).toMatchSnapshot();
    });

    it("basic auth with no auth in request", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/basic-auth.json`),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/basic-auth"
            },
            baseURL: undefined,
            environment: undefined,
            auth: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.snippet).toContain("YOUR_USERNAME");
        expect(response.snippet).toContain("YOUR_PASSWORD");
        expect(response.snippet).toMatchSnapshot();
    });

    it("basic auth with passwordOmit flag", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/basic-auth-pw-omitted.json`),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/basic-auth"
            },
            baseURL: undefined,
            environment: undefined,
            auth: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.snippet).toContain("YOUR_USERNAME");
        expect(response.snippet).not.toContain("YOUR_PASSWORD");
        expect(response.snippet).toMatchSnapshot();
    });

    it("header auth with no auth in request", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/header-auth.json`),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/apiKey"
            },
            baseURL: undefined,
            environment: undefined,
            auth: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.snippet).toContain("YOUR_AUTH_TOKEN");
        expect(response.snippet).toMatchSnapshot();
    });
});
