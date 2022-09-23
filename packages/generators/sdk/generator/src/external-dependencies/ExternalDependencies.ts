import { ExternalDependencies } from "@fern-typescript/sdk-declaration-handler";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { FernServiceUtilsImpl } from "./implementations/FernServiceUtilsImpl";
import { UrlJoinImpl } from "./implementations/UrlJoinImpl";

export declare namespace createExternalDependencies {
    export interface Args {
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;
    }
}

export function createExternalDependencies({
    addImport,
    addDependency,
}: createExternalDependencies.Args): ExternalDependencies {
    return {
        serviceUtils: new FernServiceUtilsImpl({ addImport, addDependency }),
        urlJoin: new UrlJoinImpl({ addImport, addDependency }),
    };
}
