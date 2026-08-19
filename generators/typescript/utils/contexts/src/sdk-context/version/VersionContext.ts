import { Reference } from "@fern-typescript/commons";

import { GeneratedVersion } from "./GeneratedVersion.js";

export interface VersionContext {
    getGeneratedVersion: () => GeneratedVersion | undefined;
    getReferenceToVersionEnum: () => Reference | undefined;
}
