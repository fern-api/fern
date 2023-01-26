import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ImportsManager } from "../imports-manager";
import { ExpressImpl } from "./express/ExpressImpl";
import { ExternalDependencies } from "./ExternalDependencies";
import { UrlJoinImpl } from "./url-join/UrlJoinImpl";

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
        express: new ExpressImpl({ importsManager, dependencyManager }),
    };
}
