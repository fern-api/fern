import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ImportsManager } from "../imports-manager";
import { ExpressImpl } from "./express/ExpressImpl";
import { ExternalDependencies } from "./ExternalDependencies";
import { FormDataImpl } from "./form-data/FormDataImpl";
import { FsImpl } from "./fs/FsImpl";
import { StreamImpl } from "./stream/StreamImpl";
import { UrlJoinImpl } from "./url-join/UrlJoinImpl";
import { URLSearchParamsImpl } from "./url-search-params/URLSearchParamsImpl";

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
        formData: new FormDataImpl({ importsManager, dependencyManager }),
        fs: new FsImpl({ importsManager, dependencyManager }),
        stream: new StreamImpl({ importsManager, dependencyManager }),
        URLSearchParams: new URLSearchParamsImpl({ importsManager, dependencyManager }),
    };
}
