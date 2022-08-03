import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../types";
import { FernServiceUtils } from "./implementations/FernServiceUtils";
import { UrlJoin } from "./implementations/UrlJoin";

export interface ExternalDependencies {
    serviceUtils: FernServiceUtils;
    urlJoin: UrlJoin;
}

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
        serviceUtils: new FernServiceUtils({ addImport, addDependency }),
        urlJoin: new UrlJoin({ addImport, addDependency }),
    };
}
