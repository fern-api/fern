import { DependencyManager } from "../dependency-manager/DependencyManager.js";
import { ImportsManager } from "../imports-manager/index.js";
import { BlobImpl } from "./blob/BlobImpl.js";
import { ExternalDependencies } from "./ExternalDependencies.js";
import { ExpressImpl } from "./express/ExpressImpl.js";
import { FsImpl } from "./fs/FsImpl.js";
import { StreamImpl } from "./stream/StreamImpl.js";

export declare namespace createExternalDependencies {
    export interface Args {
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
    }
}

export function createExternalDependencies({
    importsManager,
    dependencyManager
}: createExternalDependencies.Args): ExternalDependencies {
    return {
        express: new ExpressImpl({ importsManager, dependencyManager }),
        fs: new FsImpl({ importsManager, dependencyManager }),
        stream: new StreamImpl({ importsManager, dependencyManager }),
        blob: new BlobImpl({ importsManager, dependencyManager })
    };
}
