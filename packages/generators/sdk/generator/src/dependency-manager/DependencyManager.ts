export type PackageDependencies = Record<DependencyType, Record<string, string>>;

export enum DependencyType {
    PROD,
    DEV,
    PEER,
}

export class DependencyManager {
    private dependencies: PackageDependencies = {
        [DependencyType.PROD]: {},
        [DependencyType.DEV]: {},
        [DependencyType.PEER]: {},
    };

    /**
     * add a dependency.
     *
     * Note, even "@types" packages should be non-dev dependencies, since we
     * want those to be installed alongside our package (so user can click
     * through to the types we consume)
     */
    public addDependency(name: string, version: string, { preferPeer = false }: { preferPeer?: boolean } = {}): void {
        this.dependencies[DependencyType.PROD][name] = version;
        if (preferPeer) {
            this.dependencies[DependencyType.PEER][name] = "*";
        }
    }

    public getDependencies(): PackageDependencies {
        return this.dependencies;
    }
}
