/**
 * Data class to represent a Python dependency.
 * Supports writing as both pyproject.toml and requirements.txt formats.
 */
export class PythonDependency {
    private readonly name: string;
    // Assume version string is prefixed with comparator (eg. "==" or ">=")
    private readonly version: string;
    public readonly isDevDependency: boolean;

    constructor(name: string, version: string, isDevDependency: boolean = false) {
        this.name = name;
        this.version = version;
        this.isDevDependency = isDevDependency;
    }

    public toProjectTomlString(): string {
        return `${this.name} = "${this.version}"`;
    }

    public toRequirementsTxtString(): string {
        return `${this.name}${this.version}`;
    }
}
