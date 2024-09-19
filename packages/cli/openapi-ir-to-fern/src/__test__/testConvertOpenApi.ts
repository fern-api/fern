import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { parse, Spec } from "@fern-api/openapi-parser";
import { createMockTaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import path from "path";
import yaml from "js-yaml";
import { mapValues as mapValuesLodash } from "lodash-es";
import { convert, OpenApiConvertedFernDefinition } from "../convert";
import { validateFernWorkspace } from "@fern-api/fern-definition-validator";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

// eslint-disable-next-line jest/no-export
export declare namespace TestConvertOpenAPI {
    interface Options {
        asyncApiFilename?: string;
        environmentOverrides?: RawSchemas.WithEnvironmentsSchema;
        globalHeaderOverrides?: RawSchemas.WithHeadersSchema;
        authOverrides?: RawSchemas.WithAuthSchema;
    }
}

// eslint-disable-next-line jest/no-export
export function testConvertOpenAPI(fixtureName: string, filename: string, opts: TestConvertOpenAPI.Options = {}): void {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("simple", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, filename);
            const mockTaskContext = createMockTaskContext({ logger: CONSOLE_LOGGER });

            const absolutePathToAsyncAPI =
                opts.asyncApiFilename != null
                    ? join(FIXTURES_PATH, RelativeFilePath.of(fixtureName), RelativeFilePath.of(opts.asyncApiFilename))
                    : undefined;

            const specs: Spec[] = [];
            specs.push({
                absoluteFilepath: AbsoluteFilePath.of(openApiPath),
                absoluteFilepathToOverrides: undefined,
                source: {
                    type: "openapi",
                    file: AbsoluteFilePath.of(openApiPath)
                }
            });
            if (absolutePathToAsyncAPI != null) {
                specs.push({
                    absoluteFilepath: absolutePathToAsyncAPI,
                    absoluteFilepathToOverrides: undefined,
                    source: {
                        type: "asyncapi",
                        file: absolutePathToAsyncAPI
                    }
                });
            }

            const openApiIr = await parse({
                absoluteFilePathToWorkspace: FIXTURES_PATH,
                specs,
                taskContext: createMockTaskContext({ logger: CONSOLE_LOGGER })
            });
            const fernDefinition = convert({
                environmentOverrides: opts.environmentOverrides,
                globalHeaderOverrides: opts.globalHeaderOverrides,
                authOverrides: opts.authOverrides,
                ir: openApiIr,
                taskContext: mockTaskContext,
                enableUniqueErrorsPerEndpoint: false,
                detectGlobalHeaders: true
            });
            expect(fernDefinition).toMatchSnapshot();

            const fernWorkspace = toFernWorkspace(fernDefinition);

            const violations = await validateFernWorkspace(fernWorkspace, mockTaskContext.logger);
            if (violations.length > 0) {
                throw new Error(
                    `Fern definiton was generated with the following errors ${JSON.stringify(violations, undefined, 2)}`
                );
            }
        });

        it("docs", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, filename);
            const mockTaskContext = createMockTaskContext({ logger: CONSOLE_LOGGER });

            const absolutePathToAsyncAPI =
                opts.asyncApiFilename != null
                    ? join(FIXTURES_PATH, RelativeFilePath.of(fixtureName), RelativeFilePath.of(opts.asyncApiFilename))
                    : undefined;

            const specs: Spec[] = [];
            specs.push({
                absoluteFilepath: AbsoluteFilePath.of(openApiPath),
                absoluteFilepathToOverrides: undefined,
                source: {
                    type: "openapi",
                    file: AbsoluteFilePath.of(openApiPath)
                }
            });
            if (absolutePathToAsyncAPI != null) {
                specs.push({
                    absoluteFilepath: absolutePathToAsyncAPI,
                    absoluteFilepathToOverrides: undefined,
                    source: {
                        type: "asyncapi",
                        file: absolutePathToAsyncAPI
                    }
                });
            }

            const openApiIr = await parse({
                absoluteFilePathToWorkspace: FIXTURES_PATH,
                specs,
                taskContext: createMockTaskContext({ logger: CONSOLE_LOGGER })
            });
            const fernDefinition = convert({
                environmentOverrides: opts.environmentOverrides,
                authOverrides: opts.authOverrides,
                ir: openApiIr,
                taskContext: mockTaskContext,
                enableUniqueErrorsPerEndpoint: true,
                detectGlobalHeaders: false
            });
            expect(fernDefinition).toMatchSnapshot();

            const fernWorkspace = toFernWorkspace(fernDefinition);

            const violations = await validateFernWorkspace(fernWorkspace, mockTaskContext.logger);
            if (violations.length > 0) {
                throw new Error(
                    `Fern definiton was generated with the following errors ${JSON.stringify(violations, undefined, 2)}`
                );
            }
        });
    });
}

function toFernWorkspace(fernDefinition: OpenApiConvertedFernDefinition): FernWorkspace {
    return new FernWorkspace({
        changelog: undefined,
        workspaceName: undefined,
        dependenciesConfiguration: {
            dependencies: {}
        },
        definition: {
            absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
            rootApiFile: {
                defaultUrl: fernDefinition.rootApiFile["default-url"],
                contents: fernDefinition.rootApiFile,
                rawContents: yaml.dump(fernDefinition.rootApiFile)
            },
            namedDefinitionFiles: {
                ...mapValues(fernDefinition.definitionFiles, (definitionFile) => ({
                    // these files doesn't live on disk, so there's no absolute filepath
                    absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                    rawContents: yaml.dump(definitionFile),
                    contents: definitionFile
                })),
                [RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)]: {
                    // these files doesn't live on disk, so there's no absolute filepath
                    absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                    rawContents: yaml.dump(fernDefinition.packageMarkerFile),
                    contents: fernDefinition.packageMarkerFile
                }
            },
            packageMarkers: {},
            importedDefinitions: {}
        },
        sources: [],
        cliVersion: "0.0.0",
        generatorsConfiguration: undefined as any,
        absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH")
    });
}

function mapValues<T extends object, U>(items: T, mapper: (item: T[keyof T]) => U): Record<keyof T, U> {
    return mapValuesLodash(items, mapper) as Record<keyof T, U>;
}
