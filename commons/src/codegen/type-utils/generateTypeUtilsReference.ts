import { TypeDefinition } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { getImportPathForNamedType } from "../references/getImportPathForNamedType";
import { getNamespaceImport } from "../references/getNamedTypeReference";
import { getRelativePathAsModuleSpecifierTo } from "../utils/getRelativePathAsModuleSpecifierTo";

export function generateTypeUtilsReference({
    typeDefinition,
    referencedIn,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    referencedIn: SourceFile;
    modelDirectory: Directory;
}): ts.Expression {
    const moduleSpecifier = getImportPathForNamedType({
        from: referencedIn,
        typeName: typeDefinition.name,
        baseDirectory: modelDirectory,
    });
    const isTypeInCurrentFile = moduleSpecifier === `./${referencedIn.getBaseNameWithoutExtension()}`;
    if (!isTypeInCurrentFile) {
        if (!modelDirectory.isAncestorOf(referencedIn)) {
            const namespaceImport = getNamespaceImport("model");
            referencedIn.addImportDeclaration({
                moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, modelDirectory),
                namespaceImport,
            });

            return ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(namespaceImport),
                ts.factory.createIdentifier(typeDefinition.name.name)
            );
        } else {
            referencedIn.addImportDeclaration({
                moduleSpecifier,
                namedImports: [{ name: typeDefinition.name.name }],
            });
        }
    }

    return ts.factory.createIdentifier(typeDefinition.name.name);
}
