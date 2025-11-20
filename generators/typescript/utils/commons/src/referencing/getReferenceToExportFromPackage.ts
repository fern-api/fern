import { ts } from "ts-morph";

import { NamedExport } from "../exports-manager";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { GetReferenceOpts, Reference } from "./Reference";

export declare namespace getReferenceToExportFromPackage {
    export interface Args {
        importsManager: ImportsManager;
        packageName: string;
        namespaceImport?: string | undefined;
        exportedName: NamedExport;
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
    const exportedNameStr = NamedExport.getName(exportedName);
    const addImport = () => {
        importsManager.addImport(packageName, { namedImports: [namespaceImport ?? exportedName] });
    };

    const entityName =
        namespaceImport != null
            ? [exportedNameStr, ...subImport].reduce<ts.EntityName>(
                  (acc, part) => ts.factory.createQualifiedName(acc, part),
                  ts.factory.createIdentifier(namespaceImport)
              )
            : [...subImport].reduce<ts.EntityName>(
                  (acc, part) => ts.factory.createQualifiedName(acc, part),
                  ts.factory.createIdentifier(exportedNameStr)
              );

    const expression =
        namespaceImport != null
            ? [exportedNameStr, ...subImport].reduce<ts.Expression>(
                  (acc, part) => ts.factory.createPropertyAccessExpression(acc, part),
                  ts.factory.createIdentifier(namespaceImport)
              )
            : [...subImport].reduce<ts.Expression>(
                  (acc, part) => ts.factory.createPropertyAccessExpression(acc, part),
                  ts.factory.createIdentifier(exportedNameStr)
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
