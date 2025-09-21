import {
    DependencyManager,
    DependencyType,
    ExportedFilePath,
    PackageId,
    Reference,
    getExampleEndpointCalls,
    getParameterNameForRootExamplePathParameter,
    getParameterNameForRootPathParameter,
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

const DEFAULT_PACKAGE_PATH = "src";

export declare namespace JestTestGenerator {
    interface Args {
        ir: IR.IntermediateRepresentation;
        dependencyManager: DependencyManager;
        rootDirectory: Directory;
        includeSerdeLayer: boolean;
        writeUnitTests: boolean;
        generateWireTests: boolean;
        useBigInt: boolean;
        retainOriginalCasing: boolean;
        relativePackagePath: string;
        relativeTestPath: string;
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
    private readonly retainOriginalCasing: boolean;
    private readonly relativePackagePath: string;
    private readonly relativeTestPath: string;

    constructor({
        ir,
        dependencyManager,
        rootDirectory,
        includeSerdeLayer,
        writeUnitTests,
        generateWireTests,
        useBigInt,
        retainOriginalCasing,
        relativePackagePath,
        relativeTestPath
    }: JestTestGenerator.Args) {
        this.ir = ir;
        this.dependencyManager = dependencyManager;
        this.rootDirectory = rootDirectory;
        this.writeUnitTests = writeUnitTests;
        this.generateWireTests = generateWireTests;
        this.includeSerdeLayer = includeSerdeLayer;
        this.useBigInt = useBigInt;
        this.retainOriginalCasing = retainOriginalCasing;
        this.relativePackagePath = relativePackagePath;
        this.relativeTestPath = relativeTestPath;
    }

    private async addJestConfigs(): Promise<void> {
        const setupFilesAfterEnv = [];
        if (this.useBigInt) {
            setupFilesAfterEnv.push(`<rootDir>/${this.relativeTestPath}/bigint.setup.ts`);
        }
        if (this.generateWireTests || this.writeUnitTests) {
            const jestConfig = this.rootDirectory.createSourceFile(
                "jest.config.mjs",
                code`
                /** @type {import('jest').Config} */
                export default {
                    preset: "ts-jest",
                    testEnvironment: "node",
                    projects: [
                        ${
                            this.writeUnitTests
                                ? code`{
                            displayName: "unit",
                            preset: "ts-jest",
                            testEnvironment: "node",
                            moduleNameMapper: {
                                "^(\\.{1,2}/.*)\\.js$": "$1",
                            },
                            roots: ["<rootDir>/${this.relativeTestPath}"],
                            testPathIgnorePatterns: ["\\.browser\\.(spec|test)\\.[jt]sx?$", "/tests/wire/"],
                            setupFilesAfterEnv: ${arrayOf(...setupFilesAfterEnv)},
                        },
                        {
                            displayName: "browser",
                            preset: "ts-jest",
                            testEnvironment: "<rootDir>/${this.relativeTestPath}/BrowserTestEnvironment.ts",
                            moduleNameMapper: {
                                "^(\\.{1,2}/.*)\\.js$": "$1",
                            },
                            roots: ["<rootDir>/${this.relativeTestPath}"],
                            testMatch: ["<rootDir>/tests/unit/**/?(*.)+(browser).(spec|test).[jt]s?(x)"],
                            setupFilesAfterEnv: ${arrayOf(...setupFilesAfterEnv)},
                        },`
                                : ""
                        },
                        ${
                            this.generateWireTests
                                ? code`{
                            displayName: "wire",
                            preset: "ts-jest",
                            testEnvironment: "node",
                            moduleNameMapper: {
                                "^(\\.{1,2}/.*)\\.js$": "$1",
                            },
                            roots: ["<rootDir>/${this.relativeTestPath}/wire"],
                            setupFilesAfterEnv: ${arrayOf(...setupFilesAfterEnv, `<rootDir>/${this.relativeTestPath}/mock-server/setup.ts`)},
                        }`
                                : ""
                        }
                    ],
                    workerThreads: ${this.useBigInt ? "true" : "false"},
                    passWithNoTests: true,
                };
                `.toString({ dprintOptions: { indentWidth: 4 } })
            );
            await jestConfig.save();
        } else {
            const jestConfig = this.rootDirectory.createSourceFile(
                "jest.config.mjs",
                code`
                /** @type {import('jest').Config} */
                export default {
                    preset: "ts-jest",
                    testEnvironment: "node",
                    moduleNameMapper: {
                        "^(\\.{1,2}/.*)\\.js$": "$1"
                    },
                    roots: ["<rootDir>/${this.relativeTestPath}"],
                    testPathIgnorePatterns: ["\\.browser\\.(spec|test)\\.[jt]sx?$", "/tests/wire/"],
                    setupFilesAfterEnv: ${arrayOf(...setupFilesAfterEnv)},
                    workerThreads: ${this.useBigInt ? "true" : "false"},
                    passWithNoTests: true
                };
                `.toString({ dprintOptions: { indentWidth: 4 } })
            );
            await jestConfig.save();
        }
    }

    public getTestFile(service: IR.HttpService): ExportedFilePath {
        const folders = service.name.fernFilepath.packagePath.map((folder) => folder.originalName);
        const filename = `${service.name.fernFilepath.file?.camelCase.unsafeName ?? "main"}.test.ts`;

        const filePath = path.join("wire", ...folders, filename);

        return {
            directories: [],
            file: {
                nameOnDisk: filePath
            },
            rootDir: this.relativeTestPath
        };
    }

    private addDependencies(): void {
        this.dependencyManager.addDependency("jest", "^29.7.0", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("@jest/globals", "^29.7.0", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("@types/jest", "^29.5.14", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("ts-jest", "^29.3.4", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("jest-environment-jsdom", "^29.7.0", { type: DependencyType.DEV });
        if (this.generateWireTests) {
            this.dependencyManager.addDependency("msw", "^2.8.4", { type: DependencyType.DEV });
        }
    }

    public async addExtras(): Promise<void> {
        await this.addJestConfigs();
        this.addDependencies();
    }

    public get scripts(): Record<string, string> {
        const scripts: Record<string, string> = {
            test: "jest --config jest.config.mjs"
        };
        if (this.writeUnitTests) {
            scripts["test:unit"] = "jest --selectProjects unit";
            scripts["test:browser"] = "jest --selectProjects browser";
        }
        if (this.generateWireTests) {
            scripts["test:wire"] = "jest --selectProjects wire";
        }
        return scripts;
    }

    public get extraFiles(): Record<string, string> {
        const pathToRoot =
            this.relativePackagePath === DEFAULT_PACKAGE_PATH
                ? "../"
                : "../".repeat(this.relativePackagePath.split("/").length + 1);

        const extendsPath = `${pathToRoot}tsconfig.base.json`;

        const includePaths = [`${pathToRoot}${this.relativePackagePath}`, `${pathToRoot}${this.relativeTestPath}`];

        return {
            [`${this.relativeTestPath}/tsconfig.json`]: `{
    "extends": "${extendsPath}",
    "compilerOptions": {
        "outDir": null,
        "rootDir": "..",
        "baseUrl": ".."
    },
    "include": ${JSON.stringify(includePaths)},
    "exclude": []
}`,
            [`${this.relativeTestPath}/custom.test.ts`]: `
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

    public createWireTestDirectory(): void {
        const wireTestPath = `${this.relativeTestPath}/wire`;
        this.rootDirectory.createDirectory(wireTestPath);
        this.rootDirectory.createSourceFile(`${wireTestPath}/.gitkeep`, "", { overwrite: true });
    }

    public buildFile(
        serviceName: string,
        service: IR.HttpService,
        packageId: PackageId,
        serviceGenerator: GeneratedSdkClientClass,
        context: SdkContext
    ): Code | undefined {
        context.importsManager.addImportFromRoot(
            "mock-server/MockServerPool",
            {
                namedImports: ["mockServerPool"]
            },
            this.relativeTestPath
        );
        const importStatement = context.sdkClientClass.getReferenceToClientClass({ isRoot: true });

        const baseOptions: Record<string, Code> = {};
        if (this.ir.variables.length > 0) {
            return; // not supported
        }

        this.ir.pathParameters.forEach((pathParameter) => {
            baseOptions[
                getParameterNameForRootPathParameter({
                    pathParameter,
                    retainOriginalCasing: this.retainOriginalCasing
                })
            ] = code`${literalOf(pathParameter.variable ?? pathParameter.name.camelCase.unsafeName)}`;
        });
        this.ir.auth.schemes.forEach((schema) => {
            schema._visit({
                bearer: (schema) => {
                    baseOptions[schema.token.camelCase.unsafeName] = code`"test"`;
                },
                header: (schema) => {
                    baseOptions[schema.name.name.camelCase.unsafeName] = code`"test"`;
                },
                basic: (schema) => {
                    baseOptions[schema.username.camelCase.unsafeName] = code`"test"`;
                    baseOptions[schema.password.camelCase.unsafeName] = code`"test"`;
                },
                oauth: () => {
                    // noop
                    baseOptions[OAuthTokenProviderGenerator.OAUTH_CLIENT_ID_PROPERTY_NAME] = code`"test"`;
                    baseOptions[OAuthTokenProviderGenerator.OAUTH_CLIENT_SECRET_PROPERTY_NAME] = code`"test"`;
                },
                _other: () => {
                    // noop
                    return;
                }
            });
        });
        this.ir.headers.forEach((header) => {
            // We don't need to include literal types because they will automatically be included
            if (header.valueType.type === "container" && header.valueType.container.type === "literal") {
                return;
            }
            baseOptions[header.name.name.camelCase.unsafeName] = code`"test"`;
        });
        this.ir.apiVersion?._visit({
            header: (v) => {
                const propName = v.header.name.name.camelCase.unsafeName;
                const defaultValue = v.value.default?.name.wireValue;
                if (defaultValue) {
                    baseOptions[propName] = code`${literalOf(defaultValue)}`;
                    return;
                }
                if (context.type.isOptional(v.header.valueType)) {
                    return;
                }
                if (context.type.isNullable(v.header.valueType)) {
                    baseOptions[propName] = code`null`;
                    return;
                }
                const fallbackValue = v.value.values[0]?.name.wireValue;
                if (fallbackValue) {
                    baseOptions[propName] = code`${literalOf(fallbackValue)}`;
                    return;
                }
            },
            // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
            _other: () => {}
        });

        const tests = service.endpoints
            .filter((e) => this.shouldBuildTest(e))
            .map((endpoint) => this.buildTest(endpoint, serviceGenerator, context, importStatement, baseOptions))
            .filter((test) => test != null);

        if (tests.length === 0) {
            return undefined;
        }

        return code`
describe("${serviceName}", () => {
    ${tests}
});
`;
    }

    private buildTest(
        endpoint: IR.HttpEndpoint,
        serviceGenerator: GeneratedSdkClientClass,
        context: SdkContext,
        importStatement: Reference,
        baseOptions: Record<string, Code>
    ): Code | undefined {
        const options: Record<string, Code> = { ...baseOptions };
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
        const rawResponseBody = this.getResponseExample(example.response);
        const responseStatusCode = getExampleResponseStatusCode(example.response);
        const expected = getExpectedResponseBody(example.response, context);

        const generateEnvironment = () => {
            if (!this.ir.environments) {
                return code`server.baseUrl`;
            }
            return this.ir.environments.environments._visit<Code>({
                singleBaseUrl: () => {
                    return code`server.baseUrl`;
                },
                multipleBaseUrls: (environment) => {
                    return code`${literalOf(
                        Object.fromEntries(
                            environment.baseUrls.map((url) => {
                                return [url.name.camelCase.unsafeName, code`server.baseUrl`];
                            })
                        )
                    )}`;
                },
                _other: () => code`server.baseUrl`
            });
        };
        options["environment"] = generateEnvironment();
        example.rootPathParameters.forEach((pathParameter) => {
            options[
                getParameterNameForRootExamplePathParameter({
                    pathParameter,
                    retainOriginalCasing: this.retainOriginalCasing
                })
            ] = code`${literalOf(pathParameter.value.jsonExample)}`;
        });

        const isHeadersResponse = endpoint.response?.body === undefined && endpoint.method === IR.HttpMethod.Head;

        return code`
    test("${endpoint.name.originalName}", async () => {
        const server = mockServerPool.createServer();
        const client = new ${getTextOfTsNode(importStatement.getEntityName())}(${literalOf(options)});
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
            
        ${
            isHeadersResponse
                ? code`const headers = ${getTextOfTsNode(generatedExample.endpointInvocation)};
        expect(headers).toBeInstanceOf(Headers);`
                : code`const response = ${getTextOfTsNode(generatedExample.endpointInvocation)};
        expect(response).toEqual(${expected});`
        }
    });
          `;
    }

    private shouldBuildTest(endpoint: IR.HttpEndpoint): boolean {
        if (
            this.ir.auth.schemes.some((scheme) => {
                switch (scheme.type) {
                    case "basic":
                    case "bearer":
                    case "header":
                        return false; // supported
                    case "oauth":
                        return true; // not supported
                    default:
                        assertNever(scheme);
                }
            })
        ) {
            return false;
        }

        const requestType = endpoint.requestBody?.type ?? "undefined";
        switch (requestType) {
            case "bytes":
            case "fileUpload":
                return false; // not supported
            case "inlinedRequestBody":
            case "reference":
            case "undefined":
                break; // supported
            default:
                assertNever(requestType);
        }

        const responseType = endpoint.response?.body?.type ?? "undefined";
        switch (responseType) {
            case "fileDownload":
            case "text":
            case "bytes":
            case "streaming":
            case "streamParameter":
                return false; // not supported
            case "json":
            case "undefined":
                break; // supported
            default:
                assertNever(responseType);
        }
        if (endpoint.idempotent) {
            return false;
        }
        if (endpoint.pagination) {
            return false;
        }
        return true;
    }

    getRequestExample(request: ExampleRequestBody | undefined): Code | undefined {
        if (!request) {
            return undefined;
        }
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
        if (!response) {
            return undefined;
        }
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
                    if (!value) {
                        return code`undefined`;
                    }
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
