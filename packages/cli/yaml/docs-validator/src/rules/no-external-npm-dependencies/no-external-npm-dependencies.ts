import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";

import { Rule, RuleViolation } from "../../Rule";

export const NoExternalNpmDependenciesRule: Rule = {
    name: "no-external-npm-dependencies",
    create: ({ workspace: docsWorkspace }) => {
        return {
            file: async ({ config }) => {
                const violations: RuleViolation[] = [];

                // Check if experimental.mdxComponents is defined
                const mdxComponents = config.experimental?.mdxComponents;
                if (!mdxComponents || !Array.isArray(mdxComponents)) {
                    return [];
                }

                // Process each component directory
                for (const componentDir of mdxComponents) {
                    const absoluteComponentDir = join(docsWorkspace.absoluteFilePath, componentDir as RelativeFilePath);

                    if (!(await doesPathExist(absoluteComponentDir))) {
                        continue; // Skip non-existent directories (will be caught by other rules)
                    }

                    const componentViolations = await validateComponentDirectory(absoluteComponentDir, componentDir);
                    violations.push(...componentViolations);
                }

                return violations;
            }
        };
    }
};

async function validateComponentDirectory(absoluteDir: string, relativeDir: string): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    try {
        const files = await readdir(absoluteDir);

        for (const file of files) {
            const filePath = path.join(absoluteDir, file);
            const fileStat = await stat(filePath);

            if (fileStat.isDirectory()) {
                // Recursively check subdirectories
                const subViolations = await validateComponentDirectory(filePath, path.join(relativeDir, file));
                violations.push(...subViolations);
            } else if (isComponentFile(file)) {
                // Check component files for external npm dependencies
                const fileViolations = await validateComponentFile(filePath, path.join(relativeDir, file));
                violations.push(...fileViolations);
            }
        }
    } catch (error) {
        // If we can't read the directory, skip it silently
        // Other validation rules should catch directory access issues
    }

    return violations;
}

function isComponentFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ext === ".tsx" || ext === ".ts" || ext === ".jsx" || ext === ".js";
}

async function validateComponentFile(absoluteFilePath: string, relativeFilePath: string): Promise<RuleViolation[]> {
    const violations: RuleViolation[] = [];

    try {
        const content = await readFile(absoluteFilePath, "utf-8");
        const externalImports = findExternalNpmImports(content);

        for (const importInfo of externalImports) {
            violations.push({
                severity: "error",
                name: "External npm dependency in custom component",
                message: `Custom component "${relativeFilePath}" imports external npm package "${importInfo.packageName}" on line ${importInfo.line}. Custom components must not include external npm dependencies.`,
                relativeFilepath: relativeFilePath as RelativeFilePath
            });
        }
    } catch (error) {
        // If we can't read the file, skip it silently
        // Other validation rules should catch file access issues
    }

    return violations;
}

interface ImportInfo {
    packageName: string;
    line: number;
}

export function findExternalNpmImports(content: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Match import statements
        // Patterns to match:
        // import ... from "package-name"
        // import ... from 'package-name'
        // import("package-name")
        // require("package-name")
        // require('package-name')
        const importPatterns = [
            /import\s+.*\s+from\s+["']([^"'./][^"']*)["']/, // import ... from "package"
            /import\s*\(\s*["']([^"'./][^"']*)["']\s*\)/, // import("package")
            /require\s*\(\s*["']([^"'./][^"']*)["']\s*\)/ // require("package")
        ];

        for (const pattern of importPatterns) {
            const match = line?.match(pattern);
            if (match && match[1]) {
                const packageName = match[1];

                // Skip relative imports (start with . or ..)
                // Skip absolute local imports (start with /)
                // Skip built-in Node.js modules and known safe modules
                if (isExternalNpmPackage(packageName)) {
                    imports.push({
                        packageName,
                        line: lineNumber
                    });
                }
            }
        }
    }

    return imports;
}

export function isExternalNpmPackage(packageName: string): boolean {
    // Skip relative imports
    if (packageName.startsWith(".") || packageName.startsWith("/")) {
        return false;
    }

    // Skip built-in Node.js modules
    const builtInModules = new Set([
        "assert",
        "buffer",
        "child_process",
        "cluster",
        "crypto",
        "dgram",
        "dns",
        "domain",
        "events",
        "fs",
        "http",
        "https",
        "net",
        "os",
        "path",
        "punycode",
        "querystring",
        "readline",
        "repl",
        "stream",
        "string_decoder",
        "tls",
        "tty",
        "url",
        "util",
        "vm",
        "zlib"
    ]);

    if (builtInModules.has(packageName)) {
        return false;
    }

    // Allow React and related packages that might be provided by the docs platform
    const allowedPackages = new Set(["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"]);

    if (allowedPackages.has(packageName)) {
        return false;
    }

    // Everything else is considered an external npm package
    return true;
}
