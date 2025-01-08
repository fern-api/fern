import { AbsoluteFilePath } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
import { DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY } from "./utils/constant";

describe("multi-url-environment", () => {
    it("production environment", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/multi-url-environment.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/s3/presigned-url"
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
            requestBody: {
                s3Key: "xyz"
            }
        });
        expect(response.snippet).toMatchSnapshot();
    });

    it("staging environment", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/multi-url-environment.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/s3/presigned-url"
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
            requestBody: {
                s3Key: "xyz"
            }
        });
        expect(response.snippet).toMatchSnapshot();
    });

    it("custom environment", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/multi-url-environment.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/s3/presigned-url"
            },
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            baseURL: undefined,
            environment: {
                ec2: "https://custom.ec2.aws.com",
                s3: "https://custom.s3.aws.com"
            },
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: {
                s3Key: "xyz"
            }
        });
        expect(response.snippet).toMatchSnapshot();
    });

    it("invalid environment id", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/multi-url-environment.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/s3/presigned-url"
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
            requestBody: {
                s3Key: "xyz"
            }
        });
        expect(response.errors).toMatchSnapshot();
    });

    it("invalid multi url environments", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(
                `${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/multi-url-environment.json`
            ),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/s3/presigned-url"
            },
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            environment: {
                ec2: "https://custom.ec2.aws.com",
            },
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: {
                s3Key: "xyz"
            }
        });
        expect(response.errors).toMatchSnapshot();
    });
});
