import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { constructCasingsGenerator, constructFernFileContext } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

describe("SourceResolver", () => {
    it("non-existant proto source throws", async () => {
        const context = createMockTaskContext();
        const parseResult = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/invalid-source-proto/fern/api")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });
        if (!parseResult.didSucceed) {
            throw new Error("Failed to parse workspace: " + JSON.stringify(parseResult));
        }
        if (parseResult.workspace.type === "oss") {
            throw new Error("Expected fern workspace, but received openapi");
        }
        const workspace = await parseResult.workspace.toFernWorkspace({ context });

        const fooFilepath = RelativeFilePath.of("foo.yml");
        const fooFile = workspace.definition.namedDefinitionFiles[fooFilepath];
        if (fooFile == null) {
            throw new Error(`${fooFilepath} does not exist.`);
        }
        const fernFileContext = constructFernFileContext({
            relativeFilepath: fooFilepath,
            definitionFile: fooFile.contents,
            casingsGenerator: constructCasingsGenerator({
                generationLanguage: undefined,
                keywords: undefined,
                smartCasing: false
            }),
            rootApiFile: workspace.definition.rootApiFile.contents
        });

        const sourceResolver = new SourceResolverImpl(context, workspace);
        await expect(async () => {
            await sourceResolver.resolveSourceOrThrow({
                source: {
                    proto: "proto/cool-spec.proto"
                },
                relativeFilepath: fernFileContext.relativeFilepath
            });
        }).rejects.toThrow(new Error("Cannot resolve source proto/cool-spec.proto from file foo.yml"));
    });

    it("non-existant oas source does not throw", async () => {
        const context = createMockTaskContext();
        const parseResult = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/invalid-source-proto/fern/api")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });
        if (!parseResult.didSucceed) {
            throw new Error("Failed to parse workspace: " + JSON.stringify(parseResult));
        }
        if (parseResult.workspace.type === "oss") {
            throw new Error("Expected fern workspace, but received openapi");
        }
        const workspace = await parseResult.workspace.toFernWorkspace({ context });

        const fooFilepath = RelativeFilePath.of("foo.yml");
        const fooFile = workspace.definition.namedDefinitionFiles[fooFilepath];
        if (fooFile == null) {
            throw new Error(`${fooFilepath} does not exist.`);
        }
        const fernFileContext = constructFernFileContext({
            relativeFilepath: fooFilepath,
            definitionFile: fooFile.contents,
            casingsGenerator: constructCasingsGenerator({
                generationLanguage: undefined,
                keywords: undefined,
                smartCasing: false
            }),
            rootApiFile: workspace.definition.rootApiFile.contents
        });

        const sourceResolver = new SourceResolverImpl(context, workspace);
        const resolved = await sourceResolver.resolveSourceOrThrow({
            source: {
                openapi: "openapi/openapi.yaml"
            },
            relativeFilepath: fernFileContext.relativeFilepath
        });
        expect(resolved).toBeUndefined();
    });
});
