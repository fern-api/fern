import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypeResolverImpl, constructCasingsGenerator, constructFernFileContext } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

describe("TypeResolver", () => {
    it("illogical self-referencing types", async () => {
        const context = createMockTaskContext();
        const parseResult = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/illogical-self-referencing/fern/api")
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

        const typeResolver = new TypeResolverImpl(workspace);
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

        const resolvedFooType = typeResolver.resolveType({
            type: "Foo",
            file: fernFileContext
        });
        expect(resolvedFooType).toBeUndefined();

        // to make sure the file is being parsed correctly
        const resolvedBazType = typeResolver.resolveType({
            type: "Baz",
            file: fernFileContext
        });
        expect(resolvedBazType?._type).toBe("primitive");
    });
});
