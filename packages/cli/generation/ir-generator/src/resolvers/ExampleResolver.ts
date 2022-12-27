import { isPlainObject } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { EXAMPLE_REFERENCE_PREFIX } from "@fern-api/yaml-schema";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { getResolvedPathOfImportedFile } from "../utils/getResolvedPathOfImportedFile";

export interface ExampleResolver {
    resolveAllReferencesInExample: (args: {
        example: unknown;
        file: FernFileContext;
    }) => { resolvedExample: unknown } | undefined;
    resolveAllReferencesInExampleOrThrow: (args: { example: unknown; file: FernFileContext }) => {
        resolvedExample: unknown;
    };
    resolveExample: (args: {
        referenceToExample: string;
        file: FernFileContext;
    }) => { resolvedExample: unknown } | undefined;
    resolveExampleOrThrow: (args: { referenceToExample: string; file: FernFileContext }) => {
        resolvedExample: unknown;
    };
}

export class ExampleResolverImpl implements ExampleResolver {
    constructor(private readonly workspace: Workspace) {}

    public resolveAllReferencesInExample({
        example,
        file,
    }: {
        example: unknown;
        file: FernFileContext;
    }): { resolvedExample: unknown } | undefined {
        if (typeof example === "string") {
            if (example.startsWith(EXAMPLE_REFERENCE_PREFIX)) {
                return this.resolveExample({
                    referenceToExample: example,
                    file,
                });
            }
        } else if (isPlainObject(example)) {
            const newExample: typeof example = {};
            for (const [exampleKey, exampleValue] of Object.entries(example)) {
                const resolvedExampleValue = this.resolveAllReferencesInExample({ example: exampleValue, file });
                if (resolvedExampleValue == null) {
                    return undefined;
                }
                newExample[exampleKey] = resolvedExampleValue;
            }
            return { resolvedExample: newExample };
        } else if (Array.isArray(example)) {
            const newExample = [];
            for (const exampleItem of example) {
                const resolvedExampleItem = this.resolveAllReferencesInExample({ example: exampleItem, file });
                if (resolvedExampleItem == null) {
                    return undefined;
                }
                newExample.push(resolvedExampleItem);
            }
            return { resolvedExample: newExample };
        }

        return { resolvedExample: example };
    }

    public resolveAllReferencesInExampleOrThrow({ example, file }: { example: unknown; file: FernFileContext }): {
        resolvedExample: unknown;
    } {
        const resolvedExample = this.resolveAllReferencesInExample({ example, file });
        if (resolvedExample == null) {
            throw new Error("Failed to resolve examples");
        }
        return resolvedExample;
    }

    public resolveExample({
        referenceToExample,
        file,
    }: {
        referenceToExample: string;
        file: FernFileContext;
    }): { resolvedExample: unknown } | undefined {
        const [first, second, third, ...rest] = referenceToExample.split(".");

        if (first == null || second == null || rest.length > 0) {
            return undefined;
        }

        // if third is null, then the reference is to a $Type.Example in the
        // same file
        if (third == null) {
            return this.resolveExampleInFile({
                typeName: first.substring(EXAMPLE_REFERENCE_PREFIX.length),
                exampleName: second,
                file,
            });
        }

        // otherwise, the import is $imported.Type.Example
        const importPath = file.imports[first.substring(EXAMPLE_REFERENCE_PREFIX.length)];
        if (importPath == null) {
            return undefined;
        }

        const resolvedPathOfImportedFile = getResolvedPathOfImportedFile({
            referencedIn: file.relativeFilepath,
            importPath,
        });
        const serviceFile = this.workspace.serviceFiles[resolvedPathOfImportedFile];
        if (serviceFile == null) {
            return undefined;
        }

        return this.resolveExampleInFile({
            typeName: second,
            exampleName: third,
            file: constructFernFileContext({
                relativeFilepath: resolvedPathOfImportedFile,
                serviceFile,
                casingsGenerator: file.casingsGenerator,
            }),
        });
    }

    private resolveExampleInFile({
        typeName,
        exampleName,
        file,
    }: {
        typeName: string;
        exampleName: string;
        file: FernFileContext;
    }) {
        const typeDeclaration = file.serviceFile.types?.[typeName];
        if (typeof typeDeclaration === "string" || typeDeclaration?.examples == null) {
            return undefined;
        }

        const example = typeDeclaration.examples.find((otherExample) => otherExample.name === exampleName);
        if (example == null) {
            return undefined;
        }
        return this.resolveAllReferencesInExample({ example, file });
    }

    public resolveExampleOrThrow({ referenceToExample, file }: { referenceToExample: string; file: FernFileContext }): {
        resolvedExample: unknown;
    } {
        const resolvedExample = this.resolveExample({ referenceToExample, file });
        if (resolvedExample == null) {
            throw new Error("Cannot resolve example: " + referenceToExample);
        }
        return resolvedExample;
    }
}
