import { ExternalDependencies } from "@fern-typescript/contexts";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ImportsManager } from "../imports-manager/ImportsManager";
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
        urlJoin: new UrlJoinImpl({ importsManager, dependencyManager }),
    };
}
