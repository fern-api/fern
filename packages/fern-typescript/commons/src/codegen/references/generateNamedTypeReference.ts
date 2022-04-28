import { NamedType } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { getImportPathForNamedType } from "./getImportPathForNamedType";

const MODEL_NAMESPACE_IMPORT = "model";

export function generateNamedTypeReference({
    typeName,
    referencedIn,
    baseDirectory,
}: {
    typeName: NamedType;
    referencedIn: SourceFile;
    /**
     * the directory where the original type lives.
     * for types, this should be the model directory.
     * for errors, this should be the errors directory.
     */
    baseDirectory: Directory;
}): ts.TypeNode {
    // if we're importing from within the model directory, then import from the
    // actual filepath of the type
    if (baseDirectory.isAncestorOf(referencedIn)) {
        referencedIn.addImportDeclaration({
            moduleSpecifier: getImportPathForNamedType({ from: referencedIn, typeName, baseDirectory }),
            namedImports: [{ name: typeName.name }],
        });
        return ts.factory.createTypeReferenceNode(typeName.name);
    }

    // otherwise, just use `import * as model`
    referencedIn.addImportDeclaration({
        moduleSpecifier: referencedIn.getRelativePathAsModuleSpecifierTo(baseDirectory),
        namespaceImport: MODEL_NAMESPACE_IMPORT,
    });

    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(MODEL_NAMESPACE_IMPORT),
            ts.factory.createIdentifier(typeName.name)
        ),
        undefined
    );
}
