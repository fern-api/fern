import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * What a project's files are called is decided in this package. Code that spells one of the names as a string, like
 * `join(directory, "sdk-config.yaml")`, decides it again, and that is how the spellings drifted apart before. Use the
 * names and finders from `@fern-api/project-structure` instead.
 */
const CONFIG_FILENAMES = [
    "generators.yml",
    "generators.yaml",
    "generators.legacy.yml",
    "sdk-config.yml",
    "sdk-config.yaml",
    "docs.yml"
];

const CLI_PACKAGES_DIRECTORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Where the names are defined and loaded, code that is frozen to old versions, and an experiment with its own model. */
const SKIPPED_DIRECTORIES = new Set([
    "node_modules",
    "lib",
    "dist",
    "coverage",
    "fixtures",
    "__test__",
    "ete-tests",
    "project-structure",
    "configuration",
    "cli-migrations",
    "cli-v2"
]);

function listSourceFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            return SKIPPED_DIRECTORIES.has(entry.name) ? [] : listSourceFiles(entryPath);
        }
        const isSource = /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts");
        return isSource ? [entryPath] : [];
    });
}

/** Lines holding a name as a whole quoted string. Backticks are left out, since those are prose in comments. */
function findLiterals(source: string): Array<{ line: number; name: string }> {
    const literal = new RegExp(`(["'])(${CONFIG_FILENAMES.map((name) => name.replace(/\./g, "\\.")).join("|")})\\1`);
    return source.split("\n").flatMap((text, index) => {
        const name = literal.exec(text)?.[2];
        return name == null ? [] : [{ line: index + 1, name }];
    });
}

describe("config filename literals", () => {
    it("finds a name written as a quoted string", () => {
        expect(findLiterals('const file = join(directory, "sdk-config.yaml");')).toEqual([
            { line: 1, name: "sdk-config.yaml" }
        ]);
        expect(findLiterals("path.join(dir, 'docs.yml')")).toEqual([{ line: 1, name: "docs.yml" }]);
    });

    it("leaves names inside longer text and backticks alone", () => {
        expect(findLiterals('const message = "Add a generators.yml to the fern directory";')).toEqual([]);
        expect(findLiterals("/** Reads `sdk-config.yml` from the fern directory. */")).toEqual([]);
    });

    it("is not written out in the CLI source outside the packages that own the names", () => {
        const found = listSourceFiles(CLI_PACKAGES_DIRECTORY).flatMap((file) =>
            findLiterals(readFileSync(file, "utf-8")).map(
                ({ line, name }) => `${path.relative(CLI_PACKAGES_DIRECTORY, file)}:${line} ${name}`
            )
        );

        expect(found).toEqual([]);
    });
});
