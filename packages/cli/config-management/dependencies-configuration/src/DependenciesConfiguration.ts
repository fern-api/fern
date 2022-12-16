export interface DependenciesConfiguration {
    dependencies: Record<string, Dependency>;
}

export interface Dependency {
    organization: string;
    apiName: string;
    version: string;
}
