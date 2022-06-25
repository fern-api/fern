import { SourceFile, ts } from "ts-morph";
import { DependencyManager } from "./DependencyManager";

const PACKAGE_NAME = "@fern-typescript/service-utils";
const VERSION = "0.0.100";

type FernServiceUtilsExport =
    | ExportedFernServiceUtilsType
    | ExportedFernServiceUtilsValue
    | typeof SERVICE_NAMESPACE_NAME;

export type ExportedFernServiceUtilsType = "Fetcher" | "Token" | "MaybePromise";

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

const SERVICE_NAMESPACE_NAME = "Service";
export type ExportedServiceNamespaceType = "Init";

export function getReferenceToFernServiceUtilsServiceNamespaceType({
    type,
    dependencyManager,
    referencedIn,
}: {
    type: ExportedServiceNamespaceType;
    dependencyManager: DependencyManager;
    referencedIn: SourceFile;
}): ts.TypeNode {
    addFernServiceUtilsImport({ imports: [SERVICE_NAMESPACE_NAME], file: referencedIn, dependencyManager });
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createIdentifier(SERVICE_NAMESPACE_NAME),
            ts.factory.createIdentifier(type)
        )
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
