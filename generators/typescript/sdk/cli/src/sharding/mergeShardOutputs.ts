import { copyFile, mkdir, mkdtemp, readdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, parse, relative, resolve, sep } from "node:path";
import { ts } from "ts-morph";

const FILE_CONCURRENCY = 64;
const RESOURCE_INDEX_PATH = "api/resources/index.ts";
const RE_EXPORT =
    /^(?:export \{\};|export (?:type \{[^}]+\}|\{[^}]+\}|\*|\* as [A-Za-z_$][\w$]*) from ["']\.\.?\/[^"']+["'];)$/;

interface FileEntry {
    absolutePath: string;
    relativePath: string;
}

export interface MergeShardOutputsArgs {
    outputDirectory: string;
    shardDirectories: readonly string[];
}

export interface MergeShardOutputsResult {
    fileCount: number;
}

export async function mergeShardOutputs({
    outputDirectory,
    shardDirectories
}: MergeShardOutputsArgs): Promise<MergeShardOutputsResult> {
    if (shardDirectories.length === 0) {
        throw new Error("At least one shard directory is required");
    }

    const resolvedOutput = await canonicalizePath(outputDirectory);
    const resolvedShards = await Promise.all(shardDirectories.map((directory) => realpath(resolve(directory))));
    validatePaths(resolvedOutput, resolvedShards);

    await mkdir(dirname(resolvedOutput), { recursive: true });
    const stagingDirectory = await mkdtemp(join(dirname(resolvedOutput), `.${basename(resolvedOutput)}-merge-`));
    try {
        const result = await mergeIntoDirectory(stagingDirectory, resolvedShards);
        await replaceDirectory({ stagingDirectory, outputDirectory: resolvedOutput });
        return result;
    } catch (error) {
        await rm(stagingDirectory, { recursive: true, force: true });
        throw error;
    }
}

async function mergeIntoDirectory(
    outputDirectory: string,
    shardDirectories: readonly string[]
): Promise<MergeShardOutputsResult> {
    const seen = new Set<string>();
    const caseInsensitivePaths = new Map<string, string>();
    const aggregateVariants = new Map<string, string[]>();

    await mapConcurrent([outputDirectory], (directory) => mkdir(directory, { recursive: true }));

    for (const shardDirectory of shardDirectories) {
        const files = await filesUnder(shardDirectory);
        const directories = new Set<string>();
        const tasks = files.map(({ absolutePath, relativePath }) => {
            const normalizedPath = relativePath.toLowerCase();
            const previousPath = caseInsensitivePaths.get(normalizedPath);
            if (previousPath != null && previousPath !== relativePath) {
                throw new Error(`Case-only shard path collision: ${previousPath} and ${relativePath}`);
            }
            caseInsensitivePaths.set(normalizedPath, relativePath);

            const previous = seen.has(relativePath);
            if (!previous) {
                seen.add(relativePath);
                directories.add(dirname(join(outputDirectory, relativePath)));
            }
            return { absolutePath, relativePath, previous, aggregate: isAggregatePath(relativePath) };
        });

        await mapConcurrent([...directories], (directory) => mkdir(directory, { recursive: true }));
        const sources = await mapConcurrent(tasks, async ({ absolutePath, relativePath, previous, aggregate }) => {
            const source = aggregate ? await readFile(absolutePath, "utf8") : undefined;
            const destination = join(outputDirectory, relativePath);
            if (!previous) {
                await copyFile(absolutePath, destination);
            } else if (!aggregate) {
                const [current, existing] = await Promise.all([readFile(absolutePath), readFile(destination)]);
                if (!current.equals(existing)) {
                    throw new Error(`Conflicting shard file: ${relativePath}`);
                }
            }
            return source;
        });

        for (let index = 0; index < tasks.length; index++) {
            const source = sources[index];
            if (source == null) {
                continue;
            }
            const relativePath = tasks[index]?.relativePath;
            if (relativePath == null) {
                continue;
            }
            const variants = aggregateVariants.get(relativePath) ?? [];
            variants.push(source);
            aggregateVariants.set(relativePath, variants);
        }
    }

    await rebuildAggregateFiles(outputDirectory, aggregateVariants);
    await fixAndValidateRelativeSpecifiers(outputDirectory);

    return { fileCount: seen.size };
}

async function rebuildAggregateFiles(outputDirectory: string, aggregateVariants: Map<string, string[]>): Promise<void> {
    const resourceVariants = aggregateVariants.get(RESOURCE_INDEX_PATH);
    if (resourceVariants != null) {
        const resources = new Map<string, Set<string>>();
        for (const source of resourceVariants) {
            for (const line of aggregateLines(RESOURCE_INDEX_PATH, source)) {
                const resource = line.match(/from\s+["']\.\/([^/"']+)/)?.[1];
                if (resource == null) {
                    throw new Error(`Invalid resource export: ${line}`);
                }
                const lines = resources.get(resource) ?? new Set<string>();
                lines.add(line);
                resources.set(resource, lines);
            }
        }
        const resourceLines: string[] = [];
        for (const resource of [...resources.keys()].sort(compareStrings)) {
            resourceLines.push(
                ...[...(resources.get(resource) ?? [])].sort(
                    (a, b) => rankResourceExport(a) - rankResourceExport(b) || compareStrings(a, b)
                )
            );
        }
        await writeFile(join(outputDirectory, RESOURCE_INDEX_PATH), `${resourceLines.join("\n")}\n`);
    }

    for (const [aggregatePath, variants] of aggregateVariants) {
        if (aggregatePath === RESOURCE_INDEX_PATH) {
            continue;
        }
        const lines = new Set<string>();
        for (const source of variants) {
            for (const line of aggregateLines(aggregatePath, source)) {
                lines.add(line);
            }
        }
        await writeFile(join(outputDirectory, aggregatePath), `${[...lines].sort(compareStrings).join("\n")}\n`);
    }
}

async function fixAndValidateRelativeSpecifiers(outputDirectory: string): Promise<void> {
    const files = await filesUnder(outputDirectory);
    const filePaths = new Set(files.map(({ absolutePath }) => absolutePath));
    const unresolvedByFile = await mapConcurrent(
        files.filter(({ relativePath }) => relativePath.endsWith(".ts")),
        async ({ absolutePath, relativePath }) => {
            const source = await readFile(absolutePath, "utf8");
            if (!source.includes('".') && !source.includes("'.")) {
                return [];
            }

            const sourceFile = ts.createSourceFile(
                absolutePath,
                source,
                ts.ScriptTarget.Latest,
                false,
                ts.ScriptKind.TS
            );
            const replacements: Array<{ start: number; end: number; value: string }> = [];
            const unresolved: string[] = [];
            const visit = (node: ts.Node): void => {
                const specifier = getModuleSpecifier(node);
                if (specifier != null && specifier.text.startsWith(".")) {
                    const replacement = resolveRelativeSpecifier(absolutePath, specifier.text, filePaths);
                    if (replacement == null) {
                        unresolved.push(`${relativePath}: ${specifier.text}`);
                    } else if (replacement !== specifier.text) {
                        replacements.push({
                            start: specifier.getStart(sourceFile) + 1,
                            end: specifier.getEnd() - 1,
                            value: replacement
                        });
                    }
                }
                ts.forEachChild(node, visit);
            };
            visit(sourceFile);

            if (replacements.length > 0) {
                let rewritten = source;
                for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
                    rewritten =
                        rewritten.slice(0, replacement.start) + replacement.value + rewritten.slice(replacement.end);
                }
                await writeFile(absolutePath, rewritten);
            }
            return unresolved;
        }
    );
    const unresolvedSpecifiers = unresolvedByFile.flat().sort(compareStrings);
    if (unresolvedSpecifiers.length > 0) {
        throw new Error(
            `Unresolved Fern ESM specifiers (showing up to 20):\n${unresolvedSpecifiers.slice(0, 20).join("\n")}`
        );
    }
}

function getModuleSpecifier(node: ts.Node): ts.StringLiteral | undefined {
    if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier != null &&
        ts.isStringLiteral(node.moduleSpecifier)
    ) {
        return node.moduleSpecifier;
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const argument = node.arguments[0];
        return argument != null && ts.isStringLiteral(argument) ? argument : undefined;
    }
    return undefined;
}

function resolveRelativeSpecifier(sourceFile: string, specifier: string, filePaths: Set<string>): string | undefined {
    const target = resolve(dirname(sourceFile), specifier);
    if (specifier.endsWith(".js")) {
        return filePaths.has(target) || filePaths.has(`${target.slice(0, -3)}.ts`) ? specifier : undefined;
    }
    if (/\.(?:json|node)$/.test(specifier)) {
        return filePaths.has(target) ? specifier : undefined;
    }
    if (specifier.endsWith(".ts")) {
        return filePaths.has(target) ? `${specifier.slice(0, -3)}.js` : undefined;
    }
    if (filePaths.has(`${target}.ts`)) {
        return `${specifier}.js`;
    }
    if (filePaths.has(join(target, "index.ts"))) {
        return `${specifier}/index.js`;
    }
    return undefined;
}

async function filesUnder(root: string, current = root): Promise<FileEntry[]> {
    const files: FileEntry[] = [];
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => compareStrings(a.name, b.name));
    for (const entry of entries) {
        const absolutePath = join(current, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await filesUnder(root, absolutePath)));
        } else if (entry.isFile()) {
            files.push({ absolutePath, relativePath: relative(root, absolutePath).split(sep).join("/") });
        } else {
            throw new Error(`Unsupported shard entry: ${absolutePath}`);
        }
    }
    return files;
}

async function mapConcurrent<Input, Output>(
    items: readonly Input[],
    callback: (item: Input) => Promise<Output>
): Promise<Output[]> {
    const results = new Array<Output>(items.length);
    let next = 0;
    const workers = Array.from({ length: Math.min(FILE_CONCURRENCY, items.length) }, async () => {
        while (next < items.length) {
            const index = next++;
            const item = items[index];
            if (item != null) {
                results[index] = await callback(item);
            }
        }
    });
    await Promise.all(workers);
    return results;
}

function isAggregatePath(path: string): boolean {
    const normalized = path.replace(/\\/g, "/").replace(/^src\//, "");
    if (normalized.startsWith("core/")) {
        return normalized === "core/index.ts" || normalized === "core/exports.ts";
    }
    return /(?:^|\/)(?:index|exports)\.ts$/.test(normalized);
}

function aggregateLines(path: string, source: string): string[] {
    return source
        .replaceAll("\r\n", "\n")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => {
            if (line.trimStart().startsWith("//") || RE_EXPORT.test(line)) {
                return line;
            }
            throw new Error(`Non-export content in shard barrel ${path}: ${line}`);
        });
}

function validatePaths(outputDirectory: string, shardDirectories: readonly string[]): void {
    if (outputDirectory === parse(outputDirectory).root) {
        throw new Error("Shard output cannot be a filesystem root");
    }
    for (const shardDirectory of shardDirectories) {
        if (pathsOverlap(outputDirectory, shardDirectory)) {
            throw new Error(
                `Fern shard output and input directories must not overlap: ${outputDirectory}, ${shardDirectory}`
            );
        }
    }
}

async function canonicalizePath(path: string): Promise<string> {
    const resolvedPath = resolve(path);
    try {
        return await realpath(resolvedPath);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
        }
        const parent = dirname(resolvedPath);
        if (parent === resolvedPath) {
            throw error;
        }
        return join(await canonicalizePath(parent), basename(resolvedPath));
    }
}

function pathsOverlap(left: string, right: string): boolean {
    return left === right || isWithin(left, right) || isWithin(right, left);
}

function isWithin(parent: string, child: string): boolean {
    const path = relative(parent, child);
    return path !== "" && !path.startsWith(`..${sep}`) && path !== ".." && !isAbsolute(path);
}

async function replaceDirectory({
    stagingDirectory,
    outputDirectory
}: {
    stagingDirectory: string;
    outputDirectory: string;
}): Promise<void> {
    const backupDirectory = `${outputDirectory}.backup-${process.pid}-${Date.now()}`;
    let hasBackup = false;
    try {
        await rename(outputDirectory, backupDirectory);
        hasBackup = true;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
        }
    }
    try {
        await rename(stagingDirectory, outputDirectory);
        if (hasBackup) {
            await rm(backupDirectory, { recursive: true, force: true }).catch(() => undefined);
        }
    } catch (error) {
        if (hasBackup) {
            await rename(backupDirectory, outputDirectory);
        }
        throw error;
    }
}

function compareStrings(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
}

function rankResourceExport(line: string): number {
    if (line.startsWith("export * as ")) {
        return 0;
    }
    if (line.includes("/client/requests")) {
        return 1;
    }
    if (line.includes("/types")) {
        return 2;
    }
    return 3;
}
