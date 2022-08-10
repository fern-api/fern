import { WrapperName } from "@fern-typescript/commons-v2";
import { WrapperReference } from "@fern-typescript/declaration-handler/src/WrapperReference";
import { SourceFile, ts } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../../getRelativePathAsModuleSpecifierTo";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../types";
import { getEntityNameOfContainingDirectory } from "./getEntityNameOfContainingDirectory";
import { getExportedFilepathForWrapper } from "./getExportedFilepathForWrapper";
import { getExpressionToContainingDirectory } from "./getExpressionToContainingDirectory";

export declare namespace getReferenceToWrapper {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        wrapperName: WrapperName;
    }
}

export function getReferenceToWrapper({
    referencedIn,
    apiName,
    addImport,
    wrapperName,
}: getReferenceToWrapper.Args): WrapperReference {
    const moduleSpecifierOfRoot = getRelativePathAsModuleSpecifierTo(referencedIn, "/");
    addImport(moduleSpecifierOfRoot, {
        namedImports: [apiName],
    });

    const pathToWrapperFile = getExportedFilepathForWrapper(wrapperName, apiName);

    return {
        entityName: ts.factory.createQualifiedName(
            getEntityNameOfContainingDirectory({
                pathToFile: pathToWrapperFile,
            }),
            wrapperName.name
        ),
        expression: ts.factory.createPropertyAccessExpression(
            getExpressionToContainingDirectory({
                pathToFile: pathToWrapperFile,
            }),
            wrapperName.name
        ),
    };
}
