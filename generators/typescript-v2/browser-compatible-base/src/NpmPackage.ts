import { PublishInfo } from "./PublishInfo.js";

export interface NpmPackage {
    packageName: string;
    version: string;
    private: boolean;
    repoUrl: string | undefined;
    license: string | undefined;
    publishInfo: PublishInfo | undefined;
}
