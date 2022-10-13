import { FernGeneratorExec } from "@fern-fern/generator-exec-client";

export interface NpmPackage {
    scopeWithAtSign: string;
    packageName: string;
    publishInfo: PublishInfo | undefined;
}

export interface PublishInfo {
    registry: FernGeneratorExec.NpmRegistryConfig;
    packageCoordinate: FernGeneratorExec.PackageCoordinate.Npm;
}
