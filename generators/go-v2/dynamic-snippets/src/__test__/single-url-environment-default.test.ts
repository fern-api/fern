import { AbsoluteFilePath } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
import { DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY } from "./utils/constant";

describe("single-url-environment-default", () => {
    it("production environment", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/single-url-environment-default.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/dummy"
            },
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            baseURL: undefined,
            environment: "Production",
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.snippet).toMatchSnapshot();
    });

    it("staging environment", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/single-url-environment-default.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/dummy"
            },
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            baseURL: undefined,
            environment: "Staging",
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.snippet).toMatchSnapshot();
    });

    it("custom baseURL", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/single-url-environment-default.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/dummy"
            },
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            baseURL: "http://localhost:8080",
            environment: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.snippet).toMatchSnapshot();
    });

    it("invalid environment", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/single-url-environment-default.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/dummy"
            },
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            baseURL: undefined,
            environment: "Unrecognized",
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.errors).toMatchSnapshot();
    });

    it("invalid baseURL and environment", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/single-url-environment-default.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/dummy"
            },
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            baseURL: "http://localhost:8080",
            environment: "Production",
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });
        expect(response.errors).toMatchSnapshot();
    });
});
