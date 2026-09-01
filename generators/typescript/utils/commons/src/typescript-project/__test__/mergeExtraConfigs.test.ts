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
        dependencies: { "form-data": "^4.0.0" }
    };
}

describe("mergeExtraConfigs", () => {
    it("returns the package.json unchanged when extraConfigs is undefined", () => {
        expect(mergeExtraConfigs(basePackageJson(), undefined)).toEqual(basePackageJson());
    });

    it("does not mutate the input package.json", () => {
        const input = basePackageJson();
        mergeExtraConfigs(input, { exports: { ".": { custom: "./src/index.ts" } } });
        expect(input).toEqual(basePackageJson());
    });

    it("adds a custom condition to an existing subpath while keeping generated conditions", () => {
        const result = mergeExtraConfigs(basePackageJson(), {
            exports: {
                ".": {
                    "trueforge-dev": { types: "./dist/cjs/index.d.ts", default: "./src/index.ts" }
                }
            }
        });

        expect(result.exports).toEqual({
            ".": {
                "trueforge-dev": { types: "./dist/cjs/index.d.ts", default: "./src/index.ts" },
                ...ROOT_EXPORT
            },
            "./serialization": SERIALIZATION_EXPORT,
            "./package.json": "./package.json"
        });
    });

    it("places new custom conditions before the generated ones so Node can match them first", () => {
        const result = mergeExtraConfigs(basePackageJson(), {
            exports: { ".": { "trueforge-dev": "./src/index.ts" } }
        });

        const exports = result.exports as Record<string, Record<string, unknown>>;
        expect(Object.keys(exports["."] ?? {})).toEqual(["trueforge-dev", "import", "require", "default"]);
    });

    it("overrides an existing condition within a subpath, merging nested records", () => {
        const result = mergeExtraConfigs(basePackageJson(), {
            exports: { ".": { require: { types: "./custom/index.d.ts" } } }
        });

        const exports = result.exports as Record<string, Record<string, unknown>>;
        expect(exports["."]).toEqual({
            require: { types: "./custom/index.d.ts", default: "./dist/cjs/index.js" },
            import: ROOT_EXPORT.import,
            default: "./dist/cjs/index.js"
        });
    });

    it("preserves the user's exact order when they spell out a full entry in a non-generated order", () => {
        const result = mergeExtraConfigs(basePackageJson(), {
            exports: {
                ".": {
                    require: { types: "./out/index.d.ts", default: "./out/index.js" },
                    import: { types: "./out/index.d.mts", default: "./out/index.mjs" },
                    default: "./out/index.js"
                }
            }
        });

        const exports = result.exports as Record<string, Record<string, unknown>>;
        expect(Object.keys(exports["."] ?? {})).toEqual(["require", "import", "default"]);
        expect(exports["."]).toEqual({
            require: { types: "./out/index.d.ts", default: "./out/index.js" },
            import: { types: "./out/index.d.mts", default: "./out/index.mjs" },
            default: "./out/index.js"
        });
    });

    it("emits user-mentioned conditions first in user order, then inherits the unmentioned generated ones", () => {
        // Mentioning a subset in a different order moves those keys ahead of the untouched ones:
        // the user's block is authoritative for what it names, and everything else is appended after.
        const result = mergeExtraConfigs(basePackageJson(), {
            exports: { ".": { default: "./custom/index.js", require: { types: "./custom/index.d.ts" } } }
        });

        const exports = result.exports as Record<string, Record<string, unknown>>;
        expect(Object.keys(exports["."] ?? {})).toEqual(["default", "require", "import"]);
        expect(exports["."]).toEqual({
            default: "./custom/index.js",
            require: { types: "./custom/index.d.ts", default: "./dist/cjs/index.js" },
            import: ROOT_EXPORT.import
        });
    });

    it("cannot remove a generated condition: unmentioned keys are always inherited", () => {
        const result = mergeExtraConfigs(basePackageJson(), {
            exports: { ".": { import: ROOT_EXPORT.import, default: ROOT_EXPORT.default } }
        });

        const exports = result.exports as Record<string, Record<string, unknown>>;
        expect(exports["."]?.require).toEqual(ROOT_EXPORT.require);
    });

    it("uses the user's exports verbatim when the generated package.json has none (useLegacyExports)", () => {
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

        const result = mergeExtraConfigs(legacyPackageJson, { exports: userExports });

        expect(result.exports).toEqual(userExports);
        expect(Object.keys(result.exports as Record<string, unknown>)).toEqual([".", "./aws"]);
        expect(Object.keys((result.exports as Record<string, Record<string, unknown>>)["."] ?? {})).toEqual([
            "types",
            "require",
            "default"
        ]);
        expect(result.main).toEqual("./index.js");
        expect(result.scripts).toEqual(legacyPackageJson.scripts);
    });

    it("adds a whole new subpath and leaves existing subpaths untouched", () => {
        const result = mergeExtraConfigs(basePackageJson(), {
            exports: { "./internal": { default: "./dist/cjs/internal/index.js" } }
        });

        expect(result.exports).toEqual({
            "./internal": { default: "./dist/cjs/internal/index.js" },
            ".": ROOT_EXPORT,
            "./serialization": SERIALIZATION_EXPORT,
            "./package.json": "./package.json"
        });
    });

    it("replaces a scalar subpath with an object and vice versa", () => {
        const result = mergeExtraConfigs(basePackageJson(), {
            exports: {
                "./package.json": { default: "./package.json" },
                "./serialization": "./dist/cjs/serialization/index.js"
            }
        });

        const exports = result.exports as Record<string, unknown>;
        expect(exports["./package.json"]).toEqual({ default: "./package.json" });
        expect(exports["./serialization"]).toEqual("./dist/cjs/serialization/index.js");
    });

    it("treats keys that collide with Object.prototype names as regular keys", () => {
        const result = mergeExtraConfigs(basePackageJson(), {
            exports: { ".": { constructor: "./src/ctor.ts" } },
            scripts: { toString: "echo hi" }
        });

        const exports = result.exports as Record<string, Record<string, unknown>>;
        expect(exports["."]?.constructor).toEqual("./src/ctor.ts");
        expect(result.scripts).toEqual({ toString: "echo hi" });
    });

    it("unions arrays with user entries first and deduplicates", () => {
        const result = mergeExtraConfigs(basePackageJson(), { files: ["exampleFile", "dist"] });
        expect(result.files).toEqual(["exampleFile", "dist", "README.md"]);
    });

    it("merges top-level records and overrides scalars", () => {
        const result = mergeExtraConfigs(basePackageJson(), {
            version: "1.2.3",
            dependencies: { qs: "^6.11.2", "form-data": "^5.0.0" },
            browser: { execa: false }
        });

        expect(result.version).toEqual("1.2.3");
        expect(result.dependencies).toEqual({ qs: "^6.11.2", "form-data": "^5.0.0" });
        expect(Object.keys(result.dependencies ?? {})).toEqual(["qs", "form-data"]);
        expect(result.browser).toEqual({ execa: false });
    });
});
