import { describe, expect, it } from "vitest";

import { PackageConfig, PyprojectTomlGenerator } from "../project/PyprojectTomlGenerator";
import { PythonDependency, PythonDependencyType } from "../project/PythonDependency";

describe("PyprojectTomlGenerator", () => {
    describe("constructor", () => {
        it("should create instance with all required parameters", () => {
            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                [],
                [],
                new PackageConfig("test_package", "src")
            );

            expect(generator).toBeInstanceOf(PyprojectTomlGenerator);
        });
    });

    describe("toString", () => {
        it("should generate basic pyproject.toml content", () => {
            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                [],
                [],
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();

            expect(result).toContain("[project]");
            expect(result).toContain('name = "test-package"');
            expect(result).toContain("[tool.poetry]");
            expect(result).toContain('name = "test-package"');
            expect(result).toContain('version = "1.0.0"');
            expect(result).toContain("[tool.poetry.dependencies]");
            expect(result).toContain('python = "^3.8"');
            expect(result).toContain("[tool.poetry.group.dev.dependencies]");
            expect(result).toContain("[build-system]");
            expect(result).toContain('requires = ["poetry-core"]');
            expect(result).toContain('build-backend = "poetry.core.masonry.api"');
        });

        it("should include production dependencies", () => {
            const prodDependencies: PythonDependency[] = [
                { package: "requests", version: "^2.28.0", type: PythonDependencyType.PROD },
                { package: "pydantic", version: ">=1.9.2", type: PythonDependencyType.PROD }
            ];

            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                prodDependencies,
                [],
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();

            expect(result).toContain('requests = "^2.28.0"');
            expect(result).toContain('pydantic = ">=1.9.2"');
        });

        it("should include development dependencies", () => {
            const devDependencies: PythonDependency[] = [
                { package: "pytest", version: "^7.4.0", type: PythonDependencyType.DEV },
                { package: "mypy", version: "==1.13.0", type: PythonDependencyType.DEV }
            ];

            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                [],
                devDependencies,
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();

            expect(result).toContain('pytest = "^7.4.0"');
            expect(result).toContain('mypy = "==1.13.0"');
        });

        it("should include both production and development dependencies", () => {
            const prodDependencies: PythonDependency[] = [
                { package: "requests", version: "^2.28.0", type: PythonDependencyType.PROD }
            ];
            const devDependencies: PythonDependency[] = [
                { package: "pytest", version: "^7.4.0", type: PythonDependencyType.DEV }
            ];

            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                prodDependencies,
                devDependencies,
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();

            expect(result).toContain('requests = "^2.28.0"');
            expect(result).toContain('pytest = "^7.4.0"');
        });

        it("should handle package config with from field", () => {
            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                [],
                [],
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();

            expect(result).toContain('{ include = "test_package", from = "src" }');
        });

        it("should handle package config without from field", () => {
            const packageConfig = new PackageConfig("test_package", "");
            const generator = new PyprojectTomlGenerator("test-package", "1.0.0", "^3.8", [], [], packageConfig);

            const result = generator.toString();

            expect(result).toContain('{ include = "test_package" }');
        });

        it("should include all required sections in correct order", () => {
            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                [],
                [],
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();
            const lines = result.split("\n");

            // Check that sections appear in the expected order
            const projectIndex = lines.findIndex((line) => line.includes("[project]"));
            const poetryIndex = lines.findIndex((line) => line.includes("[tool.poetry]"));
            const dependenciesIndex = lines.findIndex((line) => line.includes("[tool.poetry.dependencies]"));
            const devDependenciesIndex = lines.findIndex((line) =>
                line.includes("[tool.poetry.group.dev.dependencies]")
            );
            const pluginIndex = lines.findIndex((line) => line.includes("[tool.pytest.ini_options]"));
            const buildSystemIndex = lines.findIndex((line) => line.includes("[build-system]"));

            expect(projectIndex).toBeLessThan(poetryIndex);
            expect(poetryIndex).toBeLessThan(dependenciesIndex);
            expect(dependenciesIndex).toBeLessThan(devDependenciesIndex);
            expect(devDependenciesIndex).toBeLessThan(pluginIndex);
            expect(pluginIndex).toBeLessThan(buildSystemIndex);
        });

        it("should include classifiers", () => {
            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                [],
                [],
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();
            expect(result).toContain("classifiers");
        });

        it("should include empty arrays for authors and keywords", () => {
            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                [],
                [],
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();

            expect(result).toContain("authors = []");
            expect(result).toContain("keywords = []");
        });

        it("should include empty description and README.md reference", () => {
            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                [],
                [],
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();

            expect(result).toContain('description = ""');
            expect(result).toContain('readme = "README.md"');
        });
    });

    describe("dependencyToString", () => {
        it("should format dependency correctly", () => {
            const dependency: PythonDependency = {
                package: "requests",
                version: "^2.28.0",
                type: PythonDependencyType.PROD
            };

            const result = PyprojectTomlGenerator.dependencyToString(dependency);

            expect(result).toBe('requests = "^2.28.0"');
        });

        it("should handle dependencies with different version formats", () => {
            const dependencies = [
                { package: "requests", version: "^2.28.0", type: PythonDependencyType.PROD },
                { package: "pydantic", version: ">=1.9.2", type: PythonDependencyType.PROD },
                { package: "mypy", version: "==1.13.0", type: PythonDependencyType.DEV },
                { package: "pytest", version: "~7.4.0", type: PythonDependencyType.DEV }
            ];

            dependencies.forEach((dependency) => {
                const result = PyprojectTomlGenerator.dependencyToString(dependency);
                expect(result).toBe(`${dependency.package} = "${dependency.version}"`);
            });
        });

        it("should handle package names with special characters", () => {
            const dependency: PythonDependency = {
                package: "python-dateutil",
                version: "^2.9.0",
                type: PythonDependencyType.DEV
            };

            const result = PyprojectTomlGenerator.dependencyToString(dependency);

            expect(result).toBe('python-dateutil = "^2.9.0"');
        });
    });

    describe("PackageConfig", () => {
        it("should create package config with include and from fields", () => {
            const config = new PackageConfig("test_package", "src");

            expect(config.include).toBe("test_package");
            expect(config._from).toBe("src");
        });

        it("should handle empty from field", () => {
            const config = new PackageConfig("test_package", "");

            expect(config.include).toBe("test_package");
            expect(config._from).toBe("");
        });
    });

    describe("edge cases", () => {
        it("should handle empty dependencies arrays", () => {
            const generator = new PyprojectTomlGenerator(
                "test-package",
                "1.0.0",
                "^3.8",
                [],
                [],
                new PackageConfig("test_package", "src")
            );

            const result = generator.toString();

            // Should still include the sections but with no dependencies
            expect(result).toContain("[tool.poetry.dependencies]");
            expect(result).toContain("[tool.poetry.group.dev.dependencies]");
            expect(result).toContain('python = "^3.8"');
        });
    });
});
