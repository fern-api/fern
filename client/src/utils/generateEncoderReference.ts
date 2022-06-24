import { getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { FileBasedEncoder } from "@fern-typescript/helper-utils";
import { SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../constants";

export function generateEncoderReference({
    encoder,
    referencedIn,
}: {
    encoder: FileBasedEncoder;
    referencedIn: SourceFile;
}): ts.PropertyAccessExpression {
    referencedIn.addImportDeclaration({
        namespaceImport: ClientConstants.HttpService.NamespaceImports.ENCODERS,
        moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, "/encoders"),
    });
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(ClientConstants.HttpService.NamespaceImports.ENCODERS),
        encoder.name
    );
}
