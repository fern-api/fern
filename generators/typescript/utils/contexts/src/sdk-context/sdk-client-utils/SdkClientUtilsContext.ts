import { NpmPackage, PackageId, Reference } from "@fern-typescript/commons";

import { GeneratedSdkClientUtils } from "./GeneratedSdkClientUtils";

export interface SdkClientUtilsContext {
    getGeneratedUtilsFile: (packageId: PackageId, filename: string) => GeneratedSdkClientUtils;
    getReferenceToUtils: (
        packageId: PackageId,
        options?: { importAlias?: string; npmPackage?: NpmPackage }
    ) => Reference;
}
