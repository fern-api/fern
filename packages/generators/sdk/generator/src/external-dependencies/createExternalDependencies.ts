import { ExternalDependencies } from "@fern-typescript/sdk-declaration-handler";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { FernServiceUtilsImpl } from "./implementations/FernServiceUtilsImpl";
import { UrlJoinImpl } from "./implementations/UrlJoinImpl";

export declare namespace createExternalDependencies {
    export interface Args {
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
    }
}

export function createExternalDependencies({
    importsManager,
    dependencyManager,
}: createExternalDependencies.Args): ExternalDependencies {
    return {
        serviceUtils: new FernServiceUtilsImpl({ importsManager, dependencyManager }),
        urlJoin: new UrlJoinImpl({ importsManager, dependencyManager }),
    };
}
