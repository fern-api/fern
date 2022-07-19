import { SourceFile, ts } from "ts-morph";
import { DependencyManager } from "./DependencyManager";

const PACKAGE_NAME = "@fern-typescript/service-utils";
const VERSION = "0.0.154";

type FernServiceUtilsExport = ExportedFernServiceUtilsType | ExportedFernServiceUtilsValue;

export type ExportedFernServiceUtilsType = "Fetcher" | "BearerToken" | "BasicAuth" | "Supplier";

export function getReferenceToFernServiceUtilsType({
    type,
    dependencyManager,
    referencedIn,
    typeArguments = [],
}: {
    type: ExportedFernServiceUtilsType;
    dependencyManager: DependencyManager;
    referencedIn: SourceFile;
    typeArguments?: ts.TypeNode[];
}): ts.TypeReferenceNode {
    addFernServiceUtilsImport({ imports: [type], file: referencedIn, dependencyManager });
    return ts.factory.createTypeReferenceNode(type, typeArguments);
}

export type ExportedFernServiceUtilsValue = "defaultFetcher" | "isResponseOk";

export function getReferenceToFernServiceUtilsValue({
    value,
    dependencyManager,
    referencedIn,
}: {
    value: ExportedFernServiceUtilsValue;
    dependencyManager: DependencyManager;
    referencedIn: SourceFile;
}): ts.Identifier {
    addFernServiceUtilsImport({ imports: [value], file: referencedIn, dependencyManager });
    return ts.factory.createIdentifier(value);
}

const BEARER_TOKEN_UTILS_NAME = "BearerToken";
type BearerTokenUtil = "toAuthorizationHeader" | "fromAuthorizationHeader";

export function getReferenceToFernServiceUtilsBearerTokenMethod({
    util,
    dependencyManager,
    referencedIn,
}: {
    util: BearerTokenUtil;
    dependencyManager: DependencyManager;
    referencedIn: SourceFile;
}): ts.PropertyAccessExpression {
    addFernServiceUtilsImport({ imports: [BEARER_TOKEN_UTILS_NAME], file: referencedIn, dependencyManager });
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(BEARER_TOKEN_UTILS_NAME),
        ts.factory.createIdentifier(util)
    );
}

const BASIC_AUTH_UTILS_NAME = "BasicAuth";
type BasicAuthUtil = "toAuthorizationHeader" | "fromAuthorizationHeader";

export function getReferenceToFernServiceUtilsBasicAuthMethod({
    util,
    dependencyManager,
    referencedIn,
}: {
    util: BasicAuthUtil;
    dependencyManager: DependencyManager;
    referencedIn: SourceFile;
}): ts.PropertyAccessExpression {
    addFernServiceUtilsImport({ imports: [BASIC_AUTH_UTILS_NAME], file: referencedIn, dependencyManager });
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(BASIC_AUTH_UTILS_NAME),
        ts.factory.createIdentifier(util)
    );
}

function addFernServiceUtilsImport({
    imports,
    file,
    dependencyManager,
}: {
    imports: FernServiceUtilsExport[];
    file: SourceFile;
    dependencyManager: DependencyManager;
}): void {
    file.addImportDeclaration({
        moduleSpecifier: PACKAGE_NAME,
        namedImports: imports,
    });
    dependencyManager.addDependency(PACKAGE_NAME, VERSION);
}

const SUPPLIER_UTILS_NAME = "Supplier";
type SupplierUtil = "get";

export function getReferenceToFernServiceUtilsSupplierMethod({
    util,
    dependencyManager,
    referencedIn,
}: {
    util: SupplierUtil;
    dependencyManager: DependencyManager;
    referencedIn: SourceFile;
}): ts.PropertyAccessExpression {
    addFernServiceUtilsImport({ imports: [SUPPLIER_UTILS_NAME], file: referencedIn, dependencyManager });
    return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(SUPPLIER_UTILS_NAME),
        ts.factory.createIdentifier(util)
    );
}

export function invokeSupplier({
    supplier,
    dependencyManager,
    referencedIn,
}: {
    supplier: ts.Expression;
    dependencyManager: DependencyManager;
    referencedIn: SourceFile;
}): ts.Expression {
    return ts.factory.createAwaitExpression(
        ts.factory.createCallExpression(
            getReferenceToFernServiceUtilsSupplierMethod({
                util: "get",
                dependencyManager,
                referencedIn,
            }),
            undefined,
            [supplier]
        )
    );
}
