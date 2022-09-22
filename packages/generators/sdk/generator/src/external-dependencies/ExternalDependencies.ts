import { ExternalDependencies } from "@fern-typescript/declaration-handler";
import { ModuleSpecifier } from "../declarations/utils/ModuleSpecifier";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
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
