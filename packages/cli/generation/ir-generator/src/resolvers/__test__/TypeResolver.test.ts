import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { DefinitionFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";
import { describe, expect, it } from "vitest";

import { constructFernFileContext } from "../../FernFileContext.js";
import { TypeResolverImpl } from "../TypeResolver.js";

function parsedFile<T>(contents: T) {
    return { rawContents: "", contents, defaultUrl: undefined };
}

function createWorkspace(): { workspace: FernWorkspace; namedDefinitionFilesReads: () => number } {
    let reads = 0;
    const namedDefinitionFiles = {
        [RelativeFilePath.of("a.yml")]: {
            ...parsedFile<DefinitionFileSchema>({ imports: { b: "b.yml" }, types: { A: "string" } }),
            absoluteFilepath: "/a.yml"
        },
        [RelativeFilePath.of("b.yml")]: {
            ...parsedFile<DefinitionFileSchema>({ types: { B: "integer" } }),
            absoluteFilepath: "/b.yml"
        }
    };
    const importedDefinitions = {
        [RelativeFilePath.of("dep")]: {
            url: "https://example.com",
            definition: {
                namedDefinitionFiles: {
                    [RelativeFilePath.of("c.yml")]: parsedFile<DefinitionFileSchema>({ types: { C: "boolean" } })
                },
                packageMarkers: {},
                importedDefinitions: {}
            }
        }
    };
    const definition = {
        rootApiFile: parsedFile<RootApiFileSchema>({ name: "api" }),
        packageMarkers: {},
        importedDefinitions,
        get namedDefinitionFiles() {
            reads++;
            return namedDefinitionFiles;
        }
    };
    return {
        workspace: { definition } as unknown as FernWorkspace,
        namedDefinitionFilesReads: () => reads
    };
}

function fileContext(relativeFilepath: string, definitionFile: DefinitionFileSchema) {
    return constructFernFileContext({
        relativeFilepath: RelativeFilePath.of(relativeFilepath),
        definitionFile,
        casingsGenerator: constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        }),
        rootApiFile: {} as RootApiFileSchema
    });
}

describe("TypeResolverImpl", () => {
    it("resolves declarations in local, imported and dependency files while building the file map once", () => {
        const { workspace, namedDefinitionFilesReads } = createWorkspace();
        const resolver = new TypeResolverImpl(workspace);
        const fileA = fileContext("a.yml", { imports: { b: "b.yml" } });

        expect(resolver.getDeclarationOfNamedType({ referenceToNamedType: "A", file: fileA })?.declaration).toBe(
            "string"
        );
        expect(resolver.getDeclarationOfNamedType({ referenceToNamedType: "b.B", file: fileA })?.declaration).toBe(
            "integer"
        );
        expect(
            resolver.getDeclarationOfNamedType({
                referenceToNamedType: "C",
                file: fileContext("dep/c.yml", {})
            })?.declaration
        ).toBe("boolean");
        expect(resolver.getDeclarationOfNamedType({ referenceToNamedType: "Missing", file: fileA })).toBeUndefined();

        expect(namedDefinitionFilesReads()).toBe(1);
    });
});
