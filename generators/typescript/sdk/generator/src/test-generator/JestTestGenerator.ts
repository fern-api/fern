import {
    DependencyManager,
    DependencyType,
    ExportedFilePath,
    PackageId,
    Reference,
    getExampleEndpointCalls,
    getTextOfTsNode
} from "@fern-typescript/commons";
import { GeneratedSdkClientClass, SdkContext } from "@fern-typescript/contexts";
import { OAuthTokenProviderGenerator } from "@fern-typescript/sdk-client-class-generator/src/oauth-generator/OAuthTokenProviderGenerator";
import path from "path";
import { Directory, ts } from "ts-morph";
import { Code, arrayOf, code, literalOf } from "ts-poet";

import { assertNever } from "@fern-api/core-utils";

import * as IR from "@fern-fern/ir-sdk/api";
import { ExampleRequestBody } from "@fern-fern/ir-sdk/api";

export declare namespace JestTestGenerator {
    interface Args {
        ir: IR.IntermediateRepresentation;
        dependencyManager: DependencyManager;
        rootDirectory: Directory;
        includeSerdeLayer: boolean;
        writeUnitTests: boolean;
        generateWireTests: boolean;
        useBigInt: boolean;
    }
}

export class JestTestGenerator {
    private readonly ir: IR.IntermediateRepresentation;
    private readonly dependencyManager: DependencyManager;
    private readonly rootDirectory: Directory;
    private readonly writeUnitTests: boolean;
    private readonly includeSerdeLayer: boolean;
    private readonly generateWireTests: boolean;
    private readonly useBigInt: boolean;

    constructor({
        ir,
        dependencyManager,
        rootDirectory,
        includeSerdeLayer,
        writeUnitTests,
        generateWireTests,
        useBigInt
    }: JestTestGenerator.Args) {
        this.ir = ir;
        this.dependencyManager = dependencyManager;
        this.rootDirectory = rootDirectory;
        this.writeUnitTests = writeUnitTests;
        this.generateWireTests = generateWireTests;
        this.includeSerdeLayer = includeSerdeLayer;
        this.useBigInt = useBigInt;
    }

    private addJestConfig(): void {
        const jestConfig = this.rootDirectory.createSourceFile(
            "jest.config.mjs",
            code`
            /** @type {import('jest').Config} */
            export default {
                preset: "ts-jest",
                testEnvironment: "node",
                moduleNameMapper: {
                    '(.+)\\.js$': '$1'
                },${
                    this.generateWireTests
                        ? `
                setupFilesAfterEnv: ["<rootDir>/tests/mock-server/setup.ts"],`
                        : ""
                }
            };
            `.toString({ dprintOptions: { indentWidth: 4 } })
        );
        jestConfig.saveSync();
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
        if (this.generateWireTests) {
            this.dependencyManager.addDependency("msw", "^2.8.4", { type: DependencyType.DEV });
        }
    }

    public addExtras(): void {
        this.addJestConfig();
        this.addDependencies();
    }

    public get scripts(): Record<string, string> {
        if (this.writeUnitTests) {
            return {
                test: "jest tests/unit",
                "wire:test": "yarn test:wire",
                "test:wire": "jest tests/wire"
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
        packageId: PackageId,
        serviceGenerator: GeneratedSdkClientClass,
        context: SdkContext
    ): Code {
        const fallbackTest = code`
            test("constructor", () => {
                expect(${getTextOfTsNode(
                    serviceGenerator.accessFromRootClient({
                        referenceToRootClient: ts.factory.createIdentifier("client")
                    })
                )}).toBeDefined();
            });
        `;

        context.importsManager.addImportFromRoot("tests/mock-server/MockServerPool.js", {
            namedImports: ["mockServerPool"]
        });
        const importStatement = context.sdkClientClass.getReferenceToClientClass({ isRoot: true });

        const options: [string, unknown][] = [];
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

        const tests = service.endpoints
            .map((endpoint) => {
                return this.buildTest(endpoint, packageId, serviceGenerator, context, importStatement, options);
            })
            .filter(Boolean);

        return code`
            describe("${serviceName}", () => {
                ${tests.length > 0 ? tests : fallbackTest}
            });
            `;
    }

    private buildTest(
        endpoint: IR.HttpEndpoint,
        packageId: PackageId,
        serviceGenerator: GeneratedSdkClientClass,
        context: SdkContext,
        importStatement: Reference,
        options: [string, unknown][]
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

        const rawRequestBody = this.getRequestExample(example.request);
        let rawResponseBody = this.getResponseExample(example.response);
        const responseStatusCode = getExampleResponseStatusCode(example.response);
        const expected = getExpectedResponseBody(example.response, context);

        const generateEnvironment = () => {
            if (!this.ir.environments) {
                return code`server.baseUrl`;
            }
            return this.ir.environments.environments._visit<Code | Record<string, Code>>({
                singleBaseUrl: (environment) => {
                    return code`server.baseUrl`;
                },
                multipleBaseUrls: (environment) => {
                    return Object.fromEntries(
                        environment.baseUrls.map((url) => {
                            return [url.name.camelCase.unsafeName, code`server.baseUrl`];
                        })
                    );
                },
                _other: () => code`server.baseUrl`
            });
        };
        options.push(["environment", generateEnvironment()]);

        return code`
            test("${endpoint.name.originalName}", async () => {
                const server = mockServerPool.createServer();
                const client = new ${getTextOfTsNode(importStatement.getEntityName())}(${Object.fromEntries(options)});
                ${rawRequestBody ? code`const rawRequestBody = ${rawRequestBody};` : ""}
                ${rawResponseBody ? code`const rawResponseBody = ${rawResponseBody};` : ""}
                server
                    .mockEndpoint()
                    .${endpoint.method.toLowerCase()}("${example.url}")${example.serviceHeaders.map((h) => {
                        return code`.header("${h.name.wireValue}", "${h.value.jsonExample}")
                            `;
                    })}${example.endpointHeaders.map((h) => {
                        return code`.header("${h.name.wireValue}", "${h.value.jsonExample}")
                            `;
                    })}${
                        rawRequestBody
                            ? code`.jsonBody(rawRequestBody)
                        `
                            : ""
                    }.respondWith()
                    .statusCode(${responseStatusCode})${
                        rawResponseBody
                            ? code`.jsonBody(rawResponseBody)
                        `
                            : ""
                    }.build();

                const response = ${getTextOfTsNode(generatedExample)};
                expect(response).toEqual(${expected});
            });
          `;
    }
    getRequestExample(request: ExampleRequestBody | undefined): Code | undefined {
        if (!request) return undefined;
        return request._visit({
            inlinedRequestBody: (value) => {
                return code`${literalOf(
                    Object.fromEntries(
                        value.properties.map((p) => {
                            return [p.name.wireValue, this.createRawJsonExample(p.value)];
                        })
                    )
                )}`;
            },
            reference: (value) => this.createRawJsonExample(value),
            _other: () => code`${literalOf(request.jsonExample)}`
        });
    }
    getResponseExample(response: IR.ExampleResponse | undefined): Code | undefined {
        if (!response) return undefined;
        const createRawJsonExample = this.createRawJsonExample.bind(this);
        return response._visit<Code | undefined>({
            ok: (value) => {
                return value._visit({
                    body: (value) => {
                        if (!value) {
                            return undefined;
                        }
                        return createRawJsonExample(value);
                    },
                    stream: () => {
                        throw new Error("Stream not supported in wire tests");
                    },
                    sse: () => {
                        throw new Error("SSE not supported in wire tests");
                    },
                    _other: () => {
                        throw new Error("Unsupported response type");
                    }
                });
            },
            error: (value) => {
                if (!value.body) {
                    return undefined;
                }
                return createRawJsonExample(value.body);
            },
            _other: () => {
                throw new Error("Unsupported response type");
            }
        });
    }

    createRawJsonExample({ shape, jsonExample }: IR.ExampleTypeReference): Code {
        const createRawJsonExample = this.createRawJsonExample.bind(this);
        return shape._visit<Code>({
            primitive: (value) => {
                return value._visit<Code>({
                    integer: (value) => code`${literalOf(value)}`,
                    double: (value) => code`${literalOf(value)}`,
                    string: (value) => code`${literalOf(value.original)}`,
                    boolean: (value) => code`${literalOf(value)}`,
                    long: (value) => {
                        if (this.useBigInt) {
                            return code`BigInt(${literalOf(value)})`;
                        }
                        return code`${literalOf(value)}`;
                    },
                    uint: (value) => code`${literalOf(value)}`,
                    uint64: (value) => code`${literalOf(value)}`,
                    float: (value) => code`${literalOf(value)}`,
                    base64: (value) => code`${literalOf(value)}`,
                    bigInteger: (value) => {
                        if (this.useBigInt) {
                            return code`BigInt(${literalOf(value)})`;
                        }
                        return code`${literalOf(value)}`;
                    },
                    datetime: (value) => code`${literalOf(value.raw)}`,
                    date: (value) => code`${literalOf(value)}`,
                    uuid: (value) => code`${literalOf(value)}`,
                    _other: () => code`${literalOf(jsonExample)}`
                });
            },
            container: (value) => {
                return value._visit({
                    list: (value) => {
                        return code`${arrayOf(...value.list.map((item) => createRawJsonExample(item)))}`;
                    },
                    map: (value) => {
                        return code`${literalOf(
                            Object.fromEntries(
                                value.map.map((item) => {
                                    return [item.key.jsonExample, createRawJsonExample(item.value)];
                                })
                            )
                        )}`;
                    },
                    nullable: (value) => {
                        if (!value.nullable) {
                            return code`null`;
                        }
                        return createRawJsonExample(value.nullable);
                    },
                    optional: (value) => {
                        if (!value.optional) {
                            return code`undefined`;
                        }
                        return createRawJsonExample(value.optional);
                    },
                    set: (value) => {
                        return code`${arrayOf(...value.set.map(createRawJsonExample))}`;
                    },
                    literal: (value) => {
                        return value.literal._visit({
                            integer: (value) => code`${literalOf(value)}`,
                            long: (value) => {
                                if (this.useBigInt) {
                                    return code`BigInt(${literalOf(value)})`;
                                }
                                return code`${literalOf(value)}`;
                            },
                            uint: (value) => code`${literalOf(value)}`,
                            uint64: (value) => code`${literalOf(value)}`,
                            float: (value) => code`${literalOf(value)}`,
                            double: (value) => code`${literalOf(value)}`,
                            boolean: (value) => code`${literalOf(value)}`,
                            string: (value) => code`${literalOf(value.original)}`,
                            date: (value) => code`${literalOf(value)}`,
                            datetime: (value) => code`${literalOf(value.raw)}`,
                            uuid: (value) => code`${literalOf(value)}`,
                            base64: (value) => code`${literalOf(value)}`,
                            bigInteger: (value) => {
                                if (this.useBigInt) {
                                    return code`BigInt(${value})`;
                                }
                                return code`${literalOf(value)}`;
                            },
                            _other: () => code`${literalOf(jsonExample)}`
                        });
                    },
                    _other: () => code`${literalOf(jsonExample)}`
                });
            },
            named: (value) => {
                return value.shape._visit<Code>({
                    alias: (value) => {
                        return createRawJsonExample(value.value);
                    },
                    enum: (value) => {
                        return code`${literalOf(value.value.wireValue)}`;
                    },
                    object: (value) => {
                        return code`${literalOf(
                            Object.fromEntries(
                                value.properties.map((property) => {
                                    return [property.name.wireValue, createRawJsonExample(property.value)];
                                })
                            )
                        )}`;
                    },
                    union: () => {
                        return code`${literalOf(jsonExample)}`;
                    },
                    undiscriminatedUnion: (value) => {
                        return createRawJsonExample(value.singleUnionType);
                    },
                    _other: () => {
                        return code`${literalOf(jsonExample)}`;
                    }
                });
            },
            unknown: () => {
                return code`${literalOf(jsonExample)}`;
            },
            _other: () => {
                return code`${literalOf(jsonExample)}`;
            }
        });
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
function getExampleResponseStatusCode(response: IR.ExampleResponse): number {
    return response._visit({
        ok: () => 200,
        error: () => 500,
        _other: () => {
            throw new Error("Unsupported response type");
        }
    });
}

function getExpectedResponseBody(response: IR.ExampleResponse, context: SdkContext): Code {
    return response._visit({
        ok: (response) => {
            return response._visit({
                body: (value) => {
                    if (!value) return code`undefined`;
                    const example = context.type.getGeneratedExample(value).build(context, {
                        isForSnippet: true
                    });
                    return code`${getTextOfTsNode(example)}`;
                },
                stream: () => {
                    throw new Error("Stream not supported in wire tests");
                },
                sse: () => {
                    throw new Error("SSE not supported in wire tests");
                },
                _other: () => {
                    throw new Error("Unsupported response type");
                }
            });
        },
        error: () => {
            throw new Error("Error response not supported in wire tests");
        },
        _other: () => {
            throw new Error("Unsupported response type");
        }
    });
}
