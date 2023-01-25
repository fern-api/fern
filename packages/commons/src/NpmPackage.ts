export interface NpmPackage {
    packageName: string;
    version: string;
    private: boolean;
    repoUrl: string | undefined;
    publishInfo: PublishInfo | undefined;
}

export interface PublishInfo {
    registryUrl: string;
    token: string;
}
