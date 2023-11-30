import { ts } from "ts-morph";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { GetReferenceOpts, Reference } from "./Reference";

export declare namespace getReferenceToExportFromPackage {
    export interface Args {
        importsManager: ImportsManager;
        packageName: string;
        namedImport: string;
        exportedName: string;
        subImport?: string[];
    }
}

export function getReferenceToExportFromPackage({
    importsManager,
    packageName,
    namedImport,
    exportedName,
    subImport = [],
}: getReferenceToExportFromPackage.Args): Reference {
    const addImport = () => {
        importsManager.addImport(packageName, { namedImports: [namedImport] });
    };

    const entityName = [exportedName, ...subImport].reduce<ts.EntityName>(
        (acc, part) => ts.factory.createQualifiedName(acc, part),
        ts.factory.createIdentifier(namedImport)
    );

    const expression = [exportedName, ...subImport].reduce<ts.Expression>(
        (acc, part) => ts.factory.createPropertyAccessExpression(acc, part),
        ts.factory.createIdentifier(namedImport)
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
        },
    };
}
