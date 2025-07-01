import { PythonDependency } from "./PythonDependency";

/**
 * Represents a pyproject.toml file and generates a string representation of it.
 */
export class PyprojectTomlGenerator {
    private readonly name: string;
    private readonly version: string;
    private readonly pythonVersion: string;
    private readonly dependencies: PythonDependency[];
    private readonly devDependencies: PythonDependency[];
    private readonly packageConfig: PackageConfig;

    constructor(
        name: string,
        version: string,
        pythonVersion: string,
        dependencies: PythonDependency[],
        devDependencies: PythonDependency[],
        packageConfig: PackageConfig
    ) {
        this.name = name;
        this.version = version;
        this.pythonVersion = pythonVersion;
        this.dependencies = dependencies;
        this.devDependencies = devDependencies;
        this.packageConfig = packageConfig;
    }

    public toString(): string {
        const blocks = [
            new ProjectBlock(this.name).toString(),
            new PoetryBlock(this.name, this.version, this.packageConfig).toString(),
            new DependenciesBlock(this.pythonVersion, this.dependencies, this.devDependencies).toString(),
            new PluginConfigurationBlock().toString(),
            new BuildSystemBlock().toString()
        ];

        return blocks.join("\n\n");
    }

    static dependencyToString(dependency: PythonDependency): string {
        return `${dependency.package} = "${dependency.version}"`;
    }
}

export class PackageConfig {
    readonly include: string;
    readonly _from: string;

    constructor(include: string, _from: string) {
        this.include = include;
        this._from = _from;
    }
}

/**
 * Base class for blocks in a pyproject.toml file.
 */
abstract class Block {
    public abstract toString(): string;
}

class ProjectBlock extends Block {
    private readonly name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    public toString(): string {
        return `[project]
name = "${this.name}"`;
    }
}

class PoetryBlock extends Block {
    private readonly name: string;
    private readonly version: string;
    private readonly packageConfig: PackageConfig;

    constructor(name: string, version: string, packageConfig: PackageConfig) {
        super();
        this.name = name;
        this.version = version;
        this.packageConfig = packageConfig;
    }

    public toString(): string {
        const lines: string[] = [];
        lines.push("[tool.poetry]");
        lines.push(`name = "${this.name}"`);
        if (this.version != null) {
            lines.push(`version = "${this.version}"`);
        }

        const description = "";
        const readme = "README.md";
        const authors: string[] = [];
        const keywords: string[] = [];
        const projectUrls: string[] = [];

        lines.push(`description = "${description}"`);
        lines.push(`readme = "${readme}"`);
        lines.push(`authors = ${JSON.stringify(authors, null, 4)}`);
        lines.push(`keywords = ${JSON.stringify(keywords, null, 4)}`);

        const classifiers = [
            "Intended Audience :: Developers",
            "Programming Language :: Python",
            "Programming Language :: Python :: 3",
            "Programming Language :: Python :: 3.8",
            "Programming Language :: Python :: 3.9",
            "Programming Language :: Python :: 3.10",
            "Programming Language :: Python :: 3.11",
            "Programming Language :: Python :: 3.12",
            "Operating System :: OS Independent",
            "Operating System :: POSIX",
            "Operating System :: MacOS",
            "Operating System :: POSIX :: Linux",
            "Operating System :: Microsoft :: Windows",
            "Topic :: Software Development :: Libraries :: Python Modules",
            "Typing :: Typed"
        ];
        lines.push(`\nclassifiers = ${JSON.stringify(classifiers, null, 4)}`);

        if (this.packageConfig._from != null && this.packageConfig._from.length > 0) {
            const packageLine = `{ include = "${this.packageConfig.include}", from = "${this.packageConfig._from}" }`;
            lines.push(`packages = [\n    ${packageLine}\n]`);
        } else {
            const packageLine = `{ include = "${this.packageConfig.include}" }`;
            lines.push(`packages = [\n    ${packageLine}\n]`);
        }

        if (projectUrls.length > 0) {
            lines.push("\n[project.urls]");
            lines.push(projectUrls.join("\n"));
        }

        return lines.join("\n");
    }
}

class DependenciesBlock extends Block {
    private readonly pythonVersion: string;
    private readonly prodDependencies: PythonDependency[];
    private readonly devDependencies: PythonDependency[];

    constructor(pythonVersion: string, prodDependencies: PythonDependency[], devDependencies: PythonDependency[]) {
        super();
        this.pythonVersion = pythonVersion;
        this.prodDependencies = prodDependencies;
        this.devDependencies = devDependencies;
    }

    public toString(): string {
        const lines: string[] = ["[tool.poetry.dependencies]"];
        lines.push(`python = "${this.pythonVersion}"`);
        lines.push(this.prodDependencies.map((dep) => PyprojectTomlGenerator.dependencyToString(dep)).join("\n"));

        lines[lines.length - 1] = lines[lines.length - 1] += "\n";

        lines.push("[tool.poetry.group.dev.dependencies]");
        lines.push(this.devDependencies.map((dep) => PyprojectTomlGenerator.dependencyToString(dep)).join("\n"));

        return lines.join("\n");
    }
}

class PluginConfigurationBlock extends Block {
    public toString(): string {
        return `[tool.pytest.ini_options]
testpaths = [ "tests" ]
asyncio_mode = "auto"

[tool.mypy]
plugins = ["pydantic.mypy"]

[tool.ruff]
line-length = 120

[tool.ruff.lint]
select = [
    "E",  # pycodestyle errors
    "F",  # pyflakes
    "I",  # isort
]
ignore = [
    "E402",  # Module level import not at top of file
    "E501",  # Line too long
    "E711",  # Comparison to \`None\` should be \`cond is not None\`
    "E712",  # Avoid equality comparisons to \`True\`; use \`if ...:\` checks
    "E721",  # Use \`is\` and \`is not\` for type comparisons, or \`isinstance()\` for insinstance checks
    "E722",  # Do not use bare \`except\`
    "E731",  # Do not assign a \`lambda\` expression, use a \`def\`
    "F821",  # Undefined name
    "F841"   # Local variable ... is assigned to but never used
]

[tool.ruff.lint.isort]
section-order = ["future", "standard-library", "third-party", "first-party"]`;
    }
}

class BuildSystemBlock extends Block {
    public toString(): string {
        return `[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"`;
    }
}
