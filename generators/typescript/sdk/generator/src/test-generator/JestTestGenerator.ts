import * as IR from "@fern-fern/ir-sdk/api";
import { DependencyManager, DependencyType, ExportedFilePath, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedSdkClientClass, SdkContext } from "@fern-typescript/contexts";
import path from "path";
import { Directory, ts } from "ts-morph";
import { arrayOf, code, Code, conditionalOutput, literalOf } from "ts-poet";

export class JestTestGenerator {
    constructor(
        private ir: IR.IntermediateRepresentation,
        private dependencyManager: DependencyManager,
        private rootDirectory: Directory
    ) {}

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

        const filePath = path.join(...folders, filename);
        return {
            directories: [],
            file: {
                nameOnDisk: filePath
            },
            rootDir: "tests"
        };
    }

    private addDependencies(): void {
        this.dependencyManager.addDependency("jest", "29.7.0", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("@types/jest", "29.5.5", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("ts-jest", "29.1.1", { type: DependencyType.DEV });
        this.dependencyManager.addDependency("jest-environment-jsdom", "29.7.0", { type: DependencyType.DEV });
        // this.dependencyManager.addDependency("jest-dev-server", "10.0.0", { type: DependencyType.DEV });
    }

    public addExtras(): void {
        this.addJestConfig();
        this.addDependencies();
    }

    public get scripts(): Record<string, string> {
        return {
            test: "fern test --command='jest'"
        };
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
            (endpoint.response.type === "streaming" || endpoint.response.type === "fileDownload");
        const notSupportedRequest =
            !!endpoint.requestBody &&
            (endpoint.requestBody.type === "bytes" || endpoint.requestBody.type === "fileUpload");
        const shouldSkip = endpoint.idempotent || notSupportedResponse || notSupportedRequest;
        if (shouldSkip) {
            return;
        }

        const successfulExamples = endpoint.examples.filter((example) => example.response.type === "ok");
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

        const getExpectedResponse = () => {
            const body = example.response.body;
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
                            datetime: (value) => code`new Date(${value.toISOString()})`,
                            date: (value) => code`new Date(${value})`,
                            uuid: (value) => literalOf(value),
                            _other: (value) => literalOf(value)
                        });
                    },
                    container: (value) => {
                        return value._visit({
                            list: (value) => {
                                return arrayOf(value.map((item) => visitExampleTypeReference(item)));
                            },
                            map: (value) => {
                                return Object.fromEntries(
                                    value.map((item) => {
                                        return [item.key.jsonExample, visitExampleTypeReference(item.value)];
                                    })
                                );
                            },
                            optional: (value) => {
                                if (!value) {
                                    return code`undefined`;
                                }
                                return visitExampleTypeReference(value);
                            },
                            set: (value) => {
                                return code`new Set(${arrayOf(value.map(visitExampleTypeReference))})`;
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
                                return code`${value.value.wireValue}`;
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
        const expected = shouldJsonParseStringify ? code`${adaptResponse}(response)` : "response";

        return code`
            test("${endpoint.name.camelCase.unsafeName}", async () => {
                const response = ${getTextOfTsNode(generatedExample)};
                expect(${expected}).toEqual(${response});
            });
          `;
    }
}
