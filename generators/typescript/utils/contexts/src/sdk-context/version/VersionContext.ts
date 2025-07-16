import { Reference } from "@fern-typescript/commons";

import { GeneratedVersion } from "./GeneratedVersion";

export interface VersionContext {
    getGeneratedVersion: () => GeneratedVersion | undefined;
    getReferenceToVersionEnum: () => Reference | undefined;
}
