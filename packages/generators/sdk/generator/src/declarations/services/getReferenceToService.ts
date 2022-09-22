import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { Reference } from "@fern-typescript/declaration-handler";
import { ClientConstants } from "@fern-typescript/sdk-service-declaration-handler";
import { SourceFile } from "ts-morph";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { getDirectReferenceToExport } from "../utils/getDirectReferenceToExport";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { getExportedFilepathForService } from "./getExportedFilepathForService";

export declare namespace getReferenceToService {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        serviceName: DeclaredServiceName;
        importAlias: string;
    }
}

export function getReferenceToService({
    referencedIn,
    apiName,
    addImport,
    serviceName,
    importAlias,
}: getReferenceToService.Args): Reference {
    return getDirectReferenceToExport({
        referencedIn,
        addImport,
        filepath: getExportedFilepathForService(serviceName, apiName),
        exportedName: ClientConstants.HttpService.SERVICE_NAME,
        importAlias,
    });
}
