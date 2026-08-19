/**
 * Manages dependencies for Rust SDK generation.
 * Supports conditional dependency inclusion based on IR features.
 */

export enum RustDependencyType {
    PROD = "dependencies",
    DEV = "dev-dependencies",
    BUILD = "build-dependencies"
}

export interface RustDependencySpec {
    version: string;
    features?: string[];
    optional?: boolean;
    defaultFeatures?: boolean;
    package?: string; // Rename in Cargo (optional)
    path?: string; // Local path override
    git?: string;
    branch?: string;
    rev?: string;
    registry?: string;
}

export interface TomlSections {
    dependencies: string;
    devDependencies: string;
    buildDependencies: string;
    features: string;
}

export class RustDependencyManager {
    private dependencies: Map<string, RustDependencySpec> = new Map();
    private devDependencies: Map<string, RustDependencySpec> = new Map();
    private buildDependencies: Map<string, RustDependencySpec> = new Map();
    private features: Map<string, string[]> = new Map();
    private defaultFeatures: Set<string> = new Set();

    /**
     * Add a dependency to the manager
     */
    public add(
        name: string,
        spec: RustDependencySpec | string,
        type: RustDependencyType = RustDependencyType.PROD
    ): void {
        const targetMap = this.getMapForType(type);

        const normalizedSpec: RustDependencySpec = typeof spec === "string" ? { version: spec } : spec;

        const existing = targetMap.get(name);
        if (existing) {
            const mergedSpec = this.mergeDependencySpecs(existing, normalizedSpec);
            targetMap.set(name, mergedSpec);
        } else {
            targetMap.set(name, normalizedSpec);
        }
    }

    /**
     * Get a dependency spec by name
     */
    public get(name: string, type: RustDependencyType = RustDependencyType.PROD): RustDependencySpec | undefined {
        const targetMap = this.getMapForType(type);
        return targetMap.get(name);
    }

    /**
     * Add a Cargo feature
     */
    public addFeature(name: string, members: string[]): void {
        this.features.set(name, members);
    }

    /**
     * Enable a feature in the default features list
     */
    public enableDefaultFeature(name: string): void {
        this.defaultFeatures.add(name);
    }

    /**
     * Render all sections to TOML format
     */
    public toTomlSections(): TomlSections {
        return {
            dependencies: this.renderDependencies(this.dependencies),
            devDependencies: this.renderDependencies(this.devDependencies),
            buildDependencies: this.renderDependencies(this.buildDependencies),
            features: this.renderFeatures()
        };
    }

    /**
     * Get the appropriate map for a dependency type
     */
    private getMapForType(type: RustDependencyType): Map<string, RustDependencySpec> {
        switch (type) {
            case RustDependencyType.PROD:
                return this.dependencies;
            case RustDependencyType.DEV:
                return this.devDependencies;
            case RustDependencyType.BUILD:
                return this.buildDependencies;
        }
    }

    /**
     * Merge two dependency specs, combining features
     */
    private mergeDependencySpecs(existing: RustDependencySpec, newSpec: RustDependencySpec): RustDependencySpec {
        const mergedFeatures = new Set<string>([...(existing.features || []), ...(newSpec.features || [])]);

        return {
            ...existing,
            ...newSpec,
            features: mergedFeatures.size > 0 ? Array.from(mergedFeatures) : undefined
        };
    }

    /**
     * Render dependencies map to TOML format
     */
    private renderDependencies(deps: Map<string, RustDependencySpec>): string {
        if (deps.size === 0) {
            return "";
        }

        const sorted = Array.from(deps.entries()).sort(([a], [b]) => a.localeCompare(b));
        return sorted.map(([name, spec]) => this.renderDependency(name, spec)).join("\n");
    }

    /**
     * Render a single dependency to TOML format
     */
    private renderDependency(name: string, spec: RustDependencySpec): string {
        if (
            !spec.features &&
            !spec.optional &&
            spec.defaultFeatures == null &&
            !spec.package &&
            !spec.path &&
            !spec.git
        ) {
            return `${name} = "${spec.version}"`;
        }

        const parts: string[] = [];

        if (spec.version) {
            parts.push(`version = "${spec.version}"`);
        }

        if (spec.features && spec.features.length > 0) {
            const featuresStr = spec.features.map((f) => `"${f}"`).join(", ");
            parts.push(`features = [${featuresStr}]`);
        }

        if (spec.optional) {
            parts.push("optional = true");
        }

        if (spec.defaultFeatures === false) {
            parts.push("default-features = false");
        }

        if (spec.package) {
            parts.push(`package = "${spec.package}"`);
        }

        if (spec.path) {
            parts.push(`path = "${spec.path}"`);
        }

        if (spec.git) {
            parts.push(`git = "${spec.git}"`);
        }

        if (spec.branch) {
            parts.push(`branch = "${spec.branch}"`);
        }

        if (spec.rev) {
            parts.push(`rev = "${spec.rev}"`);
        }

        if (spec.registry) {
            parts.push(`registry = "${spec.registry}"`);
        }

        return `${name} = { ${parts.join(", ")} }`;
    }

    /**
     * Render features section to TOML format
     */
    private renderFeatures(): string {
        if (this.features.size === 0 && this.defaultFeatures.size === 0) {
            return "";
        }

        const lines: string[] = [];

        if (this.defaultFeatures.size > 0) {
            const defaults = Array.from(this.defaultFeatures).sort();
            const defaultsStr = defaults.map((f) => `"${f}"`).join(", ");
            lines.push(`default = [${defaultsStr}]`);
        }

        const sortedFeatures = Array.from(this.features.entries()).sort(([a], [b]) => a.localeCompare(b));
        for (const [name, members] of sortedFeatures) {
            const membersStr = members.map((m) => `"${m}"`).join(", ");
            lines.push(`${name} = [${membersStr}]`);
        }

        return lines.join("\n");
    }
}
