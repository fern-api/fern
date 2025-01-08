import {
    DependencyManager,
    DependencyType,
    ExportedFilePath,
    getExampleEndpointCalls,
    getTextOfTsNode
} from "@fern-typescript/commons";
import { GeneratedSdkClientClass, SdkContext } from "@fern-typescript/contexts";
import { OAuthTokenProviderGenerator } from "@fern-typescript/sdk-client-class-generator/src/oauth-generator/OAuthTokenProviderGenerator";
import path from "path";
import { Directory, ts } from "ts-morph";
import { Code, arrayOf, code, conditionalOutput, literalOf } from "ts-poet";

import { assertNever } from "@fern-api/core-utils";

import * as IR from "@fern-fern/ir-sdk/api";

export declare namespace JestTestGenerator {
    interface Args {
        ir: IR.IntermediateRepresentation;
        dependencyManager: DependencyManager;
        rootDirectory: Directory;
        includeSerdeLayer: boolean;
        writeUnitTests: boolean;
    }
}

export class JestTestGenerator {
    private ir: IR.IntermediateRepresentation;
    private dependencyManager: DependencyManager;
    private rootDirectory: Directory;
    private writeUnitTests: boolean;
    private includeSerdeLayer: boolean;

    constructor({ ir, dependencyManager, rootDirectory, includeSerdeLayer, writeUnitTests }: JestTestGenerator.Args) {
        this.ir = ir;
        this.dependencyManager = dependencyManager;
        this.rootDirectory = rootDirectory;
        this.writeUnitTests = writeUnitTests;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    private addJestConfig(): void {
        const jestConfig = this.rootDirectory.createSourceFile(
            "jest.config.js",
            code`
            /** @type {import('jest').Config} */
            module.exports = {
                preset: "ts-jest",
                testEnvironment: "node",
            };
            `.toString({ dprintOptions: { indentWidth: 4 } })
            // globalSetup: "<rootDir>/tests/setup.js",
            // globalTeardown: "<rootDir>/tests/teardown.js",
        );
        jestConfig.saveSync();

        // const setupFile = this.rootDirectory.createSourceFile(
        //     "tests/setup.js",
        //     code`
        //     const { setup: setupDevServer } = require("jest-dev-server");

        //     const PORT = 56157;

        //     module.exports = async function globalSetup() {
        //         process.env.TESTS_BASE_URL = \`http://localhost:\${PORT}\`;

        //         globalThis.servers = await setupDevServer({
        //             command: \`fern mock --port=\${PORT}\`,
        //             launchTimeout: 10_000,
        //             port: PORT,
        //         });
        //     };`.toString({ dprintOptions: { indentWidth: 4 } })
        // );
        // setupFile.saveSync();
        // const teardownFile = this.rootDirectory.createSourceFile(
        //     "tests/teardown.js",
        //     code`
        //     const { teardown: teardownDevServer } = require("jest-dev-server");

        //     module.exports = async function globalSetup() {
        //         await teardownDevServer(globalThis.servers);
        //     };`.toString({ dprintOptions: { indentWidth: 4 } })
        // );
        // teardownFile.saveSync();
    }

    public getTestFile(serviceId: string, service: IR.HttpService): ExportedFilePath {
        const folders = service.name.fernFilepath.packagePath.map((folder) => folder.originalName);
        const filename = `${service.name.fernFilepath.file?.camelCase.unsafeName ?? "main"}.test.ts`;

        const filePath = path.join("wire", ...folders, filename);
        return {
            directories: [],
            file: {
                nameOnDisk: filePath
            },
            rootDir: "tests"
        };
    }

    private addDependencies(): void {
        this.dependencyManager.addDependency("jest", "^29.7.0", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("@types/jest", "^29.5.14", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("ts-jest", "^29.1.1", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("jest-environment-jsdom", "^29.7.0", { type: DependencyType.DEV });
        // this.dependencyManager.addDependency("jest-dev-server", "10.0.0", { type: DependencyType.DEV });
    }

    public addExtras(): void {
        this.addJestConfig();
        this.addDependencies();
    }

    public get scripts(): Record<string, string> {
        if (this.writeUnitTests) {
            return {
                test: "jest tests/unit",
                "wire:test": "npm install -g fern-api && fern test --command 'jest tests/wire'"
            };
        } else {
            return {
                test: "jest"
            };
        }
    }

    public get extraFiles(): Record<string, string> {
        return {
            "tests/custom.test.ts": `
/**
* This is a custom test file, if you wish to add more tests
* to your SDK.
* Be sure to mark this file in \`.fernignore\`.
*
* If you include example requests/responses in your fern definition,
* you will have tests automatically generated for you.
*/
describe("test", () => {
    it("default", () => {
        expect(true).toBe(true);
    });
});`
        };
    }

    public buildFile(
        serviceName: string,
        service: IR.HttpService,
        serviceGenerator: GeneratedSdkClientClass,
        context: SdkContext
    ): Code {
        const adaptResponse = conditionalOutput(
            // The string to output at the usage site
            "adaptResponse",
            // The code to conditionally output if convertTimestamps is used
            code`function adaptResponse(response: unknown) {
                return JSON.parse(JSON.stringify(
                    response,
                    (_key, value) => (value instanceof Set ? [...value] : value)
                ));
            }`
        );

        const tests = service.endpoints
            .map((endpoint) => {
                return this.buildTest(adaptResponse, endpoint, serviceGenerator, context);
            })
            .filter(Boolean);

        const fallbackTest = code`
            test("constructor", () => {
                expect(${getTextOfTsNode(
                    serviceGenerator.accessFromRootClient({
                        referenceToRootClient: ts.factory.createIdentifier("client")
                    })
                )}).toBeDefined();
            });
        `;

        const importStatement = context.sdkClientClass.getReferenceToClientClass({ isRoot: true });
        const envValue = code`process.env.TESTS_BASE_URL || "test"`;
        const generateEnvironment = () => {
            if (!this.ir.environments) {
                return envValue;
            }
            return this.ir.environments.environments._visit<Code | Record<string, Code>>({
                singleBaseUrl: (environment) => {
                    return envValue;
                },
                multipleBaseUrls: (environment) => {
                    return Object.fromEntries(
                        environment.baseUrls.map((url) => {
                            return [url.name.camelCase.unsafeName, envValue];
                        })
                    );
                },
                _other: () => envValue
            });
        };

        const options: [string, unknown][] = [["environment", generateEnvironment()]];
        this.ir.pathParameters.forEach((pathParameter) => {
            options.push([
                pathParameter.name.camelCase.unsafeName,
                pathParameter.variable ?? pathParameter.name.camelCase.unsafeName
            ]);
        });
        this.ir.auth.schemes.forEach((schema) => {
            schema._visit({
                bearer: (schema) => {
                    options.push([
                        schema.token.camelCase.unsafeName,
                        code`process.env.${schema.tokenEnvVar ?? "TESTS_AUTH"} || "test"`
                    ]);
                },
                header: (schema) => {
                    options.push([
                        schema.name.name.camelCase.unsafeName,
                        code`process.env.${schema.headerEnvVar ?? "TESTS_AUTH"} || "test"`
                    ]);
                },
                basic: (schema) => {
                    options.push([
                        schema.username.camelCase.safeName,
                        code`process.env.${schema.usernameEnvVar ?? "TESTS_USERNAME"} || "test"`
                    ]);
                    options.push([
                        schema.password.camelCase.unsafeName,
                        code`process.env.${schema.passwordEnvVar ?? "TESTS_PASSWORD"} || "test"`
                    ]);
                },
                oauth: (schema) => {
                    // noop
                    options.push([
                        OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME,
                        code`process.env.${schema.configuration.clientIdEnvVar ?? "TESTS_CLIENT_ID"} || "test"`
                    ]);
                    options.push([
                        OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME,
                        code`process.env.${schema.configuration.clientSecretEnvVar ?? "TESTS_CLIENT_SECRET"} || "test"`
                    ]);
                },
                _other: () => {
                    // noop
                }
            });
        });
        if (this.ir.auth.schemes.some((scheme) => scheme.type === "basic")) {
            options.push(["username", code`process.env.TESTS_USERNAME || "test"`]);
            options.push(["password", code`process.env.TESTS_PASSWORD || "test"`]);
        }
        this.ir.headers.forEach((header) => {
            // We don't need to include literal types because they will automatically be included
            if (header.valueType.type === "container" && header.valueType.container.type === "literal") {
                return;
            }
            options.push([header.name.name.camelCase.unsafeName, code`process.env.TESTS_HEADER || "test"`]);
        });

        return code`
            const client = new ${getTextOfTsNode(importStatement.getEntityName())}(${Object.fromEntries(options)});

            ${adaptResponse.ifUsed}

            describe("${serviceName}", () => {
                ${tests.length > 0 ? tests : fallbackTest}
            });
            `;
    }

    private buildTest(
        adaptResponse: ReturnType<typeof conditionalOutput>,
        endpoint: IR.HttpEndpoint,
        serviceGenerator: GeneratedSdkClientClass,
        context: SdkContext
    ): Code | undefined {
        const notSupportedResponse =
            !!endpoint.response &&
            (endpoint.response.body?.type === "streaming" || endpoint.response.body?.type === "fileDownload");
        const notSupportedRequest =
            !!endpoint.requestBody &&
            (endpoint.requestBody.type === "bytes" || endpoint.requestBody.type === "fileUpload");
        const shouldSkip =
            endpoint.idempotent ||
            (endpoint.pagination != null && context.config.generatePaginatedClients) ||
            notSupportedResponse ||
            notSupportedRequest;
        if (shouldSkip) {
            return;
        }

        const successfulExamples = getExampleEndpointCalls(endpoint).filter(
            (example) => example.response.type === "ok"
        );
        const example = successfulExamples[0];
        if (!example) {
            return;
        }

        const generatedEndpoint = serviceGenerator.getEndpoint({
            endpointId: endpoint.id,
            context
        });
        if (!generatedEndpoint) {
            return;
        }
        const generatedExample = generatedEndpoint.getExample({
            context,
            example,
            opts: {
                isForSnippet: true,
                isForComment: false
            },
            clientReference: ts.factory.createIdentifier("client")
        });

        if (!generatedExample) {
            return;
        }

        if (example.response.type !== "ok") {
            throw new Error("Only successful responses are supported");
        }

        // For certain complex types, we just JSON.parse/JSON.stringify to simplify some times
        let shouldJsonParseStringify = false;

        const includeSerdeLayer = this.includeSerdeLayer;

        const getExpectedResponse = () => {
            const body = getExampleTypeReferenceForResponse(example.response);
            if (!body) {
                return code`undefined`;
            }

            const visitExampleTypeReference = ({ shape, jsonExample }: IR.ExampleTypeReference): Code | unknown => {
                return shape._visit({
                    primitive: (value) => {
                        return value._visit({
                            integer: (value) => literalOf(value),
                            double: (value) => literalOf(value),
                            string: (value) => literalOf(value.original),
                            boolean: (value) => literalOf(value),
                            long: (value) => literalOf(value),
                            uint: (value) => literalOf(value),
                            uint64: (value) => literalOf(value),
                            float: (value) => literalOf(value),
                            base64: (value) => literalOf(value),
                            bigInteger: (value) => literalOf(value),
                            datetime: (value) => {
                                return includeSerdeLayer
                                    ? code`new Date(${literalOf(value.datetime.toISOString())})`
                                    : literalOf(value.raw);
                            },
                            date: (value) => literalOf(value),
                            uuid: (value) => literalOf(value),
                            _other: (value) => literalOf(value)
                        });
                    },
                    container: (value) => {
                        return value._visit({
                            list: (value) => {
                                return arrayOf(...value.list.map((item) => visitExampleTypeReference(item)));
                            },
                            map: (value) => {
                                return Object.fromEntries(
                                    value.map.map((item) => {
                                        return [item.key.jsonExample, visitExampleTypeReference(item.value)];
                                    })
                                );
                            },
                            optional: (value) => {
                                if (!value.optional) {
                                    return code`undefined`;
                                }
                                return visitExampleTypeReference(value.optional);
                            },
                            set: (value) => {
                                // return code`new Set(${arrayOf(value.map(visitExampleTypeReference))})`;
                                // Sets are not supported in ts-sdk
                                return arrayOf(...value.set.map(visitExampleTypeReference));
                            },
                            literal: (value) => {
                                return jsonExample;
                            },
                            _other: (value) => {
                                return jsonExample;
                            }
                        });
                    },
                    named: (value) => {
                        return value.shape._visit({
                            alias: (value) => {
                                return code`${visitExampleTypeReference(value.value)}`;
                            },
                            enum: (value) => {
                                return literalOf(value.value.wireValue);
                            },
                            object: (value) => {
                                return Object.fromEntries(
                                    value.properties.map((property) => {
                                        return [
                                            property.name.name.camelCase.unsafeName,
                                            visitExampleTypeReference(property.value)
                                        ];
                                    })
                                );
                            },
                            union: (value) => {
                                shouldJsonParseStringify = true;
                                return jsonExample;
                            },
                            undiscriminatedUnion: (value) => {
                                shouldJsonParseStringify = true;
                                return code`${visitExampleTypeReference(value.singleUnionType)}`;
                            },
                            _other: (value: { type: string }) => {
                                return jsonExample;
                            }
                        });
                    },
                    unknown: (value) => {
                        return code`${literalOf(jsonExample)}`;
                    },
                    _other: (value) => {
                        return jsonExample;
                    }
                });
            };

            return visitExampleTypeReference(body);
        };

        const response = getExpectedResponse();
        const expected = "response";
        // Uncomment if/when we support Sets in responses from the TS-SDK
        // const expected = shouldJsonParseStringify ? code`${adaptResponse}(response)` : "response";

        return code`
            test("${endpoint.name.camelCase.unsafeName}", async () => {
                const response = ${getTextOfTsNode(generatedExample)};
                expect(${expected}).toEqual(${response});
            });
          `;
    }
}

function getExampleTypeReferenceForResponse(exampleResponse: IR.ExampleResponse): IR.ExampleTypeReference | undefined {
    switch (exampleResponse.type) {
        case "ok":
            return getExampleTypeReferenceForSuccessResponse(exampleResponse.value);
        case "error":
            return exampleResponse.body;
        default:
            assertNever(exampleResponse);
    }
}

// TODO: Update this to handle multiple responses in the stream and sse cases.
function getExampleTypeReferenceForSuccessResponse(
    successResponse: IR.ExampleEndpointSuccessResponse
): IR.ExampleTypeReference | undefined {
    switch (successResponse.type) {
        case "body":
            return successResponse.value;
        case "stream":
            return successResponse.value[0];
        case "sse":
            return successResponse.value[0]?.data;
        default:
            assertNever(successResponse);
    }
}
