/**
 * Data class to represent a Python dependency.
 * Supports writing as both pyproject.toml and requirements.txt formats.
 */
export interface PythonDependency {
    readonly package: string;
    // Assume version string is prefixed with comparator (eg. "==" or ">=")
    readonly version: string;
    readonly type: PythonDependencyType;
}

export enum PythonDependencyType {
    PROD = "prod",
    DEV = "dev"
}
