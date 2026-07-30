import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";
import { describe, expect, it } from "vitest";
import { FernDefinition } from "../AbstractAPIWorkspace.js";
import { FernWorkspace } from "../FernWorkspace.js";
import { getDefinitionFile } from "../utils/getDefinitionFile.js";

describe("getDefinitionFile", () => {
    it("resolves local and imported files", () => {
        const localContents = { types: {} };
        const importedContents = { types: {} };
        const importPath = RelativeFilePath.of("dependencies/widgets");
        const importedDefinition = createDefinition({
            "types/imported.yml": importedContents
        });
        const definition = createDefinition(
            { "types/local.yml": localContents },
            {
                [importPath]: {
                    url: undefined,
                    definition: importedDefinition
                }
            }
        );
        const workspace = createWorkspace(definition);

        expect(getDefinitionFile(workspace, RelativeFilePath.of("types/local.yml"))).toBe(localContents);
        expect(getDefinitionFile(workspace, RelativeFilePath.of("dependencies/widgets/types/imported.yml"))).toBe(
            importedContents
        );
        expect(getDefinitionFile(workspace, RelativeFilePath.of("types/missing.yml"))).toBeUndefined();
    });

    it("caches files per workspace", () => {
        const originalContents = { types: {} };
        const replacementContents = { types: {} };
        const relativeFilepath = RelativeFilePath.of("types/widget.yml");
        const definition = createDefinition({ [relativeFilepath]: originalContents });
        const firstWorkspace = createWorkspace(definition);

        expect(getDefinitionFile(firstWorkspace, relativeFilepath)).toBe(originalContents);

        const replacementDefinition = createDefinition({ [relativeFilepath]: replacementContents });
        const secondWorkspace = createWorkspace(replacementDefinition);

        expect(getDefinitionFile(firstWorkspace, relativeFilepath)).toBe(originalContents);
        expect(getDefinitionFile(secondWorkspace, relativeFilepath)).toBe(replacementContents);
    });
});

function createWorkspace(definition: FernDefinition): FernWorkspace {
    return new FernWorkspace({
        absoluteFilePath: definition.absoluteFilePath,
        changelog: undefined,
        cliVersion: "0.0.0",
        definition,
        dependenciesConfiguration: { dependencies: {} },
        generatorsConfiguration: undefined,
        workspaceName: undefined
    });
}

function createDefinition(
    files: Record<string, { types: Record<string, never> }>,
    importedDefinitions: FernDefinition["importedDefinitions"] = {}
): FernDefinition {
    return {
        absoluteFilePath: AbsoluteFilePath.of("/fern/api"),
        rootApiFile: {
            rawContents: "",
            contents: { name: "Test API" },
            defaultUrl: undefined
        },
        namedDefinitionFiles: Object.fromEntries(
            Object.entries(files).map(([relativeFilepath, contents]) => {
                const path = RelativeFilePath.of(relativeFilepath);
                return [
                    path,
                    {
                        absoluteFilePath: AbsoluteFilePath.of(`/fern/api/${relativeFilepath}`),
                        rawContents: "",
                        contents,
                        defaultUrl: undefined
                    }
                ];
            })
        ) as FernDefinition["namedDefinitionFiles"],
        packageMarkers: {},
        importedDefinitions
    };
}
