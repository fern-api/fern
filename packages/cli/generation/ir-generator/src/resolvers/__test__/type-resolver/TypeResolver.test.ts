import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { constructCasingsGenerator } from "../../../casings/CasingsGenerator";
import { constructFernFileContext } from "../../../FernFileContext";
import { TypeResolverImpl } from "../../TypeResolver";

describe("TypeResolver", () => {
    it("illogical self-referencing types", async () => {
        const parseResult = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures/illogical-self-referencing/fern/api")
            ),
            context: createMockTaskContext(),
            cliVersion: "0.0.0",
            workspaceName: undefined
        });
        if (!parseResult.didSucceed) {
            throw new Error("Failed to parse workspace: " + JSON.stringify(parseResult));
        }
        if (parseResult.workspace.type === "openapi") {
            throw new Error("Expected fern workspace, but received openapi");
        }

        const fooFilepath = RelativeFilePath.of("foo.yml");
        const fooFile = parseResult.workspace.definition.namedDefinitionFiles[fooFilepath];
        if (fooFile == null) {
            throw new Error(`${fooFilepath} does not exist.`);
        }

        const typeResolver = new TypeResolverImpl(parseResult.workspace);
        const fernFileContext = constructFernFileContext({
            relativeFilepath: fooFilepath,
            definitionFile: fooFile.contents,
            casingsGenerator: constructCasingsGenerator({
                generationLanguage: undefined,
                smartCasing: false
            }),
            rootApiFile: parseResult.workspace.definition.rootApiFile.contents
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
