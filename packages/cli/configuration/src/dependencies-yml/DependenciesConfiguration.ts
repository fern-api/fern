import { AbsoluteFilePath } from '@fern-api/path-utils'

export interface DependenciesConfiguration {
    dependencies: Record<string, Dependency>
}

export type Dependency = VersionedDependency | LocalApiDependency

export interface VersionedDependency {
    type: 'version'
    organization: string
    apiName: string
    version: string
}

export interface LocalApiDependency {
    type: 'local'
    path: string
    absoluteFilepath: AbsoluteFilePath
}
