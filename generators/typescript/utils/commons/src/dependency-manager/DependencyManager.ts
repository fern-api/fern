export type PackageDependencies = Record<DependencyType, Record<string, string>>;

export enum DependencyType {
    PROD,
    DEV,
    PEER
}

export class DependencyManager {
    private dependencies: PackageDependencies = {
        [DependencyType.PROD]: {},
        [DependencyType.DEV]: {},
        [DependencyType.PEER]: {}
    };

    public addDependency(
        name: string,
        version: string,
        { type = DependencyType.PROD }: { type?: DependencyType } = {}
    ): void {
        switch (type) {
            case DependencyType.DEV:
                this.dependencies[DependencyType.DEV][name] = version;
                return;
            case DependencyType.PEER:
                this.dependencies[DependencyType.PEER][name] = version;
                return;
            case DependencyType.PROD:
                this.dependencies[DependencyType.PROD][name] = version;
                return;
        }
    }

    public getDependencies(): PackageDependencies {
        return this.dependencies;
    }
}
