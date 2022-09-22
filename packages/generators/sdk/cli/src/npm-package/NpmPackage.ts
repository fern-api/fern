import { NpmRegistryConfig } from "@fern-fern/generator-exec-client/model/config";
import { PackageCoordinate } from "@fern-fern/generator-exec-client/model/logging";

export interface NpmPackage {
    scopeWithAtSign: string;
    packageName: string;
    publishInfo: PublishInfo | undefined;
}

export interface PublishInfo {
    registry: NpmRegistryConfig;
    packageCoordinate: PackageCoordinate.Npm;
}
