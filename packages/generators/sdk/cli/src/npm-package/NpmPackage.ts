import { FernGeneratorExec } from "@fern-fern/generator-exec-client";

export interface NpmPackage {
    packageName: string;
    publishInfo: PublishInfo | undefined;
}

export interface PublishInfo {
    registry: FernGeneratorExec.NpmRegistryConfigV2;
    packageCoordinate: FernGeneratorExec.PackageCoordinate.Npm;
}
