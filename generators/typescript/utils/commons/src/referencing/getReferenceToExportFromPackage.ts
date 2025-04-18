import { ts } from "ts-morph";

import { ImportsManager } from "../imports-manager/ImportsManager";
import { GetReferenceOpts, Reference } from "./Reference";

export declare namespace getReferenceToExportFromPackage {
    export interface Args {
        importsManager: ImportsManager;
        packageName: string;
        namespaceImport?: string | undefined;
        exportedName: string;
        subImport?: string[];
    }
}

export function getReferenceToExportFromPackage({
    importsManager,
    packageName,
    namespaceImport,
    exportedName,
    subImport = []
}: getReferenceToExportFromPackage.Args): Reference {
    const addImport = () => {
        importsManager.addImport(packageName, { namedImports: [namespaceImport ?? exportedName] });
    };

    const entityName =
        namespaceImport != null
            ? [exportedName, ...subImport].reduce<ts.EntityName>(
                  (acc, part) => ts.factory.createQualifiedName(acc, part),
                  ts.factory.createIdentifier(namespaceImport)
              )
            : [...subImport].reduce<ts.EntityName>(
                  (acc, part) => ts.factory.createQualifiedName(acc, part),
                  ts.factory.createIdentifier(exportedName)
              );

    const expression =
        namespaceImport != null
            ? [exportedName, ...subImport].reduce<ts.Expression>(
                  (acc, part) => ts.factory.createPropertyAccessExpression(acc, part),
                  ts.factory.createIdentifier(namespaceImport)
              )
            : [...subImport].reduce<ts.Expression>(
                  (acc, part) => ts.factory.createPropertyAccessExpression(acc, part),
                  ts.factory.createIdentifier(exportedName)
              );

    const typeNode = ts.factory.createTypeReferenceNode(entityName);

    return {
        getTypeNode: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport();
            }
            return typeNode;
        },
        getEntityName: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport();
            }
            return entityName;
        },
        getExpression: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport();
            }
            return expression;
        }
    };
}
