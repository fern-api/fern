import { IPackageJson } from "package-json-type";
import { describe, expect, it } from "vitest";

import { mergeExtraConfigs } from "../mergeExtraConfigs.js";

const ROOT_EXPORT = {
    import: { types: "./dist/esm/index.d.mts", default: "./dist/esm/index.mjs" },
    require: { types: "./dist/cjs/index.d.ts", default: "./dist/cjs/index.js" },
    default: "./dist/cjs/index.js"
};

const SERIALIZATION_EXPORT = {
    import: { types: "./dist/esm/serialization/index.d.mts", default: "./dist/esm/serialization/index.mjs" },
    require: { types: "./dist/cjs/serialization/index.d.ts", default: "./dist/cjs/serialization/index.js" },
    default: "./dist/cjs/serialization/index.js"
};

const TRUEFORGE_DEV = { types: "./dist/cjs/index.d.ts", default: "./src/index.ts" };

function basePackageJson(): IPackageJson {
    return {
        name: "@acme/sdk",
        version: "0.0.1",
        exports: {
            ".": ROOT_EXPORT,
            "./serialization": SERIALIZATION_EXPORT,
            "./package.json": "./package.json"
        },
        files: ["dist", "README.md"],
        scripts: { build: "tsc", test: "vitest" },
        dependencies: { "form-data": "^4.0.0" },
        peerDependenciesMeta: { openai: { optional: true } }
    };
}

function exportsOf(result: IPackageJson): Record<string, Record<string, unknown>> {
    return result.exports as Record<string, Record<string, unknown>>;
}

describe("mergeExtraConfigs", () => {
    describe("shared behavior", () => {
        it.each([
            "shallow",
            "deep"
        ] as const)("returns the package.json unchanged when extraConfigs is undefined (%s)", (strategy) => {
            expect(mergeExtraConfigs(basePackageJson(), undefined, strategy)).toEqual(basePackageJson());
        });

        it.each(["shallow", "deep"] as const)("does not mutate the input package.json (%s)", (strategy) => {
            const input = basePackageJson();
            mergeExtraConfigs(input, { exports: { ".": { custom: "./src/index.ts" } } }, strategy);
            expect(input).toEqual(basePackageJson());
        });

        it.each([
            "shallow",
            "deep"
        ] as const)("uses the user's exports verbatim when the generated package.json has none, e.g. useLegacyExports (%s)", (strategy) => {
            const legacyPackageJson: IPackageJson = {
                name: "cohere-ai",
                version: "7.0.0",
                main: "./index.js",
                types: "./index.d.ts",
                scripts: { build: "tsc", prepack: "cp -rv dist/. ." }
            };
            const userExports = {
                ".": { types: "./index.d.ts", require: "./index.js", default: "./index.js" },
                "./aws": { types: "./aws.d.ts", require: "./aws.js", default: "./aws.js" }
            };

            const result = mergeExtraConfigs(legacyPackageJson, { exports: userExports }, strategy);

            expect(result.exports).toEqual(userExports);
            expect(Object.keys(exportsOf(result))).toEqual([".", "./aws"]);
            expect(Object.keys(exportsOf(result)["."] ?? {})).toEqual(["types", "require", "default"]);
            expect(result.main).toEqual("./index.js");
            expect(result.scripts).toEqual(legacyPackageJson.scripts);
        });
    });

    describe("shallow (default, historical behavior)", () => {
        it("is the default strategy", () => {
            const extra = { exports: { ".": { "trueforge-dev": TRUEFORGE_DEV } } };
            expect(mergeExtraConfigs(basePackageJson(), extra)).toEqual(
                mergeExtraConfigs(basePackageJson(), extra, "shallow")
            );
        });

        it("replaces an overridden subpath wholesale: a condition-only override drops the generated conditions", () => {
            // This is the historical (and, without opting into "deep", expected) behavior: the resulting
            // "." entry has no import/require/default and is not resolvable by Node. Do not "fix" this
            // path; users who want a merge opt in via packageJsonMergeStrategy: deep.
            const result = mergeExtraConfigs(basePackageJson(), {
                exports: { ".": { "trueforge-dev": TRUEFORGE_DEV } }
            });

            expect(exportsOf(result)["."]).toEqual({ "trueforge-dev": TRUEFORGE_DEV });
            expect(exportsOf(result)["./serialization"]).toEqual(SERIALIZATION_EXPORT);
            expect(exportsOf(result)["./package.json"]).toEqual("./package.json");
        });

        it("adds a new subpath after the generated ones", () => {
            const result = mergeExtraConfigs(basePackageJson(), {
                exports: { "./internal": { default: "./dist/cjs/internal/index.js" } }
            });

            expect(Object.keys(exportsOf(result))).toEqual([".", "./serialization", "./package.json", "./internal"]);
            expect(exportsOf(result)["./internal"]).toEqual({ default: "./dist/cjs/internal/index.js" });
        });

        it("merges flat records one level deep with generated keys first and user-only keys appended", () => {
            const result = mergeExtraConfigs(basePackageJson(), {
                scripts: { lint: "eslint", build: "node build.js" },
                dependencies: { qs: "^6.11.2", stream: "^0.0.2" }
            });

            expect(Object.keys(result.scripts ?? {})).toEqual(["build", "test", "lint"]);
            expect(result.scripts).toEqual({ build: "node build.js", test: "vitest", lint: "eslint" });
            expect(Object.keys(result.dependencies ?? {})).toEqual(["form-data", "qs", "stream"]);
        });

        it("replaces nested records at depth two instead of merging them", () => {
            const result = mergeExtraConfigs(basePackageJson(), {
                peerDependenciesMeta: { openai: { dev: true } }
            });

            expect(result.peerDependenciesMeta).toEqual({ openai: { dev: true } });
        });

        it("unions arrays with user entries first and deduplicates", () => {
            const result = mergeExtraConfigs(basePackageJson(), { files: ["exampleFile", "dist"] });
            expect(result.files).toEqual(["exampleFile", "dist", "README.md"]);
        });

        it("overrides scalars", () => {
            expect(mergeExtraConfigs(basePackageJson(), { version: "1.2.3" }).version).toEqual("1.2.3");
        });
    });

    describe("deep", () => {
        it("adds a custom condition to an existing subpath while keeping generated conditions", () => {
            const result = mergeExtraConfigs(
                basePackageJson(),
                { exports: { ".": { "trueforge-dev": TRUEFORGE_DEV } } },
                "deep"
            );

            expect(result.exports).toEqual({
                ".": { "trueforge-dev": TRUEFORGE_DEV, ...ROOT_EXPORT },
                "./serialization": SERIALIZATION_EXPORT,
                "./package.json": "./package.json"
            });
        });

        it("places new custom conditions before the generated ones so Node can match them first", () => {
            const result = mergeExtraConfigs(
                basePackageJson(),
                { exports: { ".": { "trueforge-dev": "./src/index.ts" } } },
                "deep"
            );

            expect(Object.keys(exportsOf(result)["."] ?? {})).toEqual([
                "trueforge-dev",
                "import",
                "require",
                "default"
            ]);
        });

        it("overrides an existing condition within a subpath, merging nested records", () => {
            const result = mergeExtraConfigs(
                basePackageJson(),
                { exports: { ".": { require: { types: "./custom/index.d.ts" } } } },
                "deep"
            );

            expect(exportsOf(result)["."]).toEqual({
                require: { types: "./custom/index.d.ts", default: "./dist/cjs/index.js" },
                import: ROOT_EXPORT.import,
                default: "./dist/cjs/index.js"
            });
        });

        it("preserves the user's exact order when they spell out a full entry in a non-generated order", () => {
            const fullEntry = {
                require: { types: "./out/index.d.ts", default: "./out/index.js" },
                import: { types: "./out/index.d.mts", default: "./out/index.mjs" },
                default: "./out/index.js"
            };
            const result = mergeExtraConfigs(basePackageJson(), { exports: { ".": fullEntry } }, "deep");

            expect(Object.keys(exportsOf(result)["."] ?? {})).toEqual(["require", "import", "default"]);
            expect(exportsOf(result)["."]).toEqual(fullEntry);
        });

        it("emits user-mentioned conditions first in user order, then inherits the unmentioned generated ones", () => {
            // Mentioning a subset in a different order moves those keys ahead of the untouched ones:
            // the user's block is authoritative for what it names, and everything else is appended after.
            const result = mergeExtraConfigs(
                basePackageJson(),
                { exports: { ".": { default: "./custom/index.js", require: { types: "./custom/index.d.ts" } } } },
                "deep"
            );

            expect(Object.keys(exportsOf(result)["."] ?? {})).toEqual(["default", "require", "import"]);
            expect(exportsOf(result)["."]).toEqual({
                default: "./custom/index.js",
                require: { types: "./custom/index.d.ts", default: "./dist/cjs/index.js" },
                import: ROOT_EXPORT.import
            });
        });

        it("cannot remove a generated condition: unmentioned keys are always inherited", () => {
            const result = mergeExtraConfigs(
                basePackageJson(),
                { exports: { ".": { import: ROOT_EXPORT.import, default: ROOT_EXPORT.default } } },
                "deep"
            );

            expect(exportsOf(result)["."]?.require).toEqual(ROOT_EXPORT.require);
        });

        it("adds a whole new subpath and leaves existing subpaths untouched", () => {
            const result = mergeExtraConfigs(
                basePackageJson(),
                { exports: { "./internal": { default: "./dist/cjs/internal/index.js" } } },
                "deep"
            );

            expect(result.exports).toEqual({
                "./internal": { default: "./dist/cjs/internal/index.js" },
                ".": ROOT_EXPORT,
                "./serialization": SERIALIZATION_EXPORT,
                "./package.json": "./package.json"
            });
        });

        it("replaces a scalar subpath with an object and vice versa", () => {
            const result = mergeExtraConfigs(
                basePackageJson(),
                {
                    exports: {
                        "./package.json": { default: "./package.json" },
                        "./serialization": "./dist/cjs/serialization/index.js"
                    }
                },
                "deep"
            );

            expect(exportsOf(result)["./package.json"]).toEqual({ default: "./package.json" });
            expect(exportsOf(result)["./serialization"]).toEqual("./dist/cjs/serialization/index.js");
        });

        it("treats keys that collide with Object.prototype names as regular keys", () => {
            const result = mergeExtraConfigs(
                basePackageJson(),
                { exports: { ".": { constructor: "./src/ctor.ts" } }, scripts: { toString: "echo hi" } },
                "deep"
            );

            expect(exportsOf(result)["."]?.constructor).toEqual("./src/ctor.ts");
            expect(result.scripts).toEqual({ toString: "echo hi", build: "tsc", test: "vitest" });
        });

        it("unions arrays with user entries first and deduplicates", () => {
            const result = mergeExtraConfigs(basePackageJson(), { files: ["exampleFile", "dist"] }, "deep");
            expect(result.files).toEqual(["exampleFile", "dist", "README.md"]);
        });

        it("merges nested records and overrides scalars, emitting user keys first", () => {
            const result = mergeExtraConfigs(
                basePackageJson(),
                {
                    version: "1.2.3",
                    dependencies: { qs: "^6.11.2", "form-data": "^5.0.0" },
                    peerDependenciesMeta: { openai: { dev: true } }
                },
                "deep"
            );

            expect(result.version).toEqual("1.2.3");
            expect(Object.keys(result.dependencies ?? {})).toEqual(["qs", "form-data"]);
            expect(result.dependencies).toEqual({ qs: "^6.11.2", "form-data": "^5.0.0" });
            expect(result.peerDependenciesMeta).toEqual({ openai: { dev: true, optional: true } });
        });
    });
});
