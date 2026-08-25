import { readFile } from "node:fs/promises";
import { docsYml } from "@fern-api/configuration";
import { extractErrorMessage } from "@fern-api/core-utils";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { cloneRepositoryAtRef, resolveRepositorySubpath } from "@fern-api/github";
import { CliError, type TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

import { generateCpp } from "./CppDocsGenerator.js";
import { type LocalParserConfig, runLocalParser } from "./LocalParserRunner.js";
import { generate } from "./PythonDocsGenerator.js";
import type { CppLibraryDocsIr } from "./types/CppLibraryDocsIr.js";

export type LibraryLanguage = "PYTHON" | "CPP";

function isGitLibraryInput(
    input: docsYml.RawSchemas.LibraryInputConfiguration
): input is docsYml.RawSchemas.GitLibraryInputSchema {
    return "git" in input;
}

function toLanguage(lang: docsYml.RawSchemas.LibraryConfiguration["lang"]): LibraryLanguage | undefined {
    if (lang === "python") {
        return "PYTHON";
    }
    if (lang === "cpp") {
        return "CPP";
    }
    return undefined;
}

/**
 * Wrap a long-running step. Callers can pass a spinner-based wrapper to
 * render progress; the default just calls `operation` directly so all
 * progress messages flow through `context.logger`.
 */
export type StepWrapper = <T>(opts: { message: string; operation: () => Promise<T> }) => Promise<T>;

const defaultWrapStep: StepWrapper = ({ operation }) => operation();

/**
 * Iterates over the configured libraries, producing the library-docs IR and
 * running the local MDX generator for each.
 *
 * The IR is produced by running the parser Docker images directly on the
 * user's machine — no network calls or authentication are required.
 *
 * All libraries are attempted (via `Promise.allSettled`) so a single failure
 * does not abort generation for the remaining ones. If any library failed,
 * the first error is re-thrown so the caller exits non-zero with a
 * specific, actionable message.
 */
export async function runLibraryDocsGeneration({
    libraries,
    library,
    docsDirectoryPath,
    context,
    wrapStep = defaultWrapStep
}: {
    libraries: Record<string, docsYml.RawSchemas.LibraryConfiguration | undefined>;
    /** Optional library name to filter to a single entry. */
    library?: string;
    /** Absolute path of the directory containing docs.yml — used to resolve input/output paths. */
    docsDirectoryPath: AbsoluteFilePath;
    context: TaskContext;
    wrapStep?: StepWrapper;
}): Promise<{ successful: number }> {
    if (Object.keys(libraries).length === 0) {
        throw new CliError({
            message:
                "No libraries configured in docs.yml.\n\n" +
                "  Add a 'libraries' section to configure library documentation.",
            code: CliError.Code.ConfigError
        });
    }

    if (library != null && libraries[library] == null) {
        throw new CliError({
            message:
                `Library '${library}' not found in docs.yml.\n\n` +
                `  Available libraries: ${Object.keys(libraries).join(", ")}`,
            code: CliError.Code.ConfigError
        });
    }

    const librariesToGenerate = library != null ? { [library]: libraries[library] } : libraries;

    const results = await Promise.allSettled(
        Object.entries(librariesToGenerate).map(async ([name, config]) => {
            if (config == null) {
                throw new CliError({
                    message: `Library '${name}': missing configuration`,
                    code: CliError.Code.ConfigError
                });
            }
            await generateSingleLibrary({
                context,
                name,
                config,
                docsDirectoryPath,
                wrapStep
            });
        })
    );

    const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");

    if (failures.length > 0) {
        // Surface failures exactly once: the CLI's task handler prints the thrown
        // CliError, so logging here as well would double-print each message. A single
        // failure is re-thrown as-is (preserving its error code); multiple failures are
        // combined into one message.
        const soleReason = failures.length === 1 ? failures[0]?.reason : undefined;
        if (soleReason instanceof CliError) {
            throw soleReason;
        }
        throw new CliError({
            message: failures.map((failure) => extractErrorMessage(failure.reason)).join("\n"),
            code: CliError.Code.InternalError
        });
    }

    return { successful: results.length - failures.length };
}

async function generateSingleLibrary({
    context,
    name,
    config,
    docsDirectoryPath,
    wrapStep
}: {
    context: TaskContext;
    name: string;
    config: docsYml.RawSchemas.LibraryConfiguration;
    docsDirectoryPath: AbsoluteFilePath;
    wrapStep: StepWrapper;
}): Promise<void> {
    const resolvedOutputPath = resolve(docsDirectoryPath, config.output.path);

    if (config.config?.doxyfile != null && config.lang !== "cpp") {
        throw new CliError({
            message: `Library '${name}': 'doxyfile' config is only valid for lang: cpp`,
            code: CliError.Code.ConfigError
        });
    }

    let doxyfileContent: string | undefined;
    if (config.lang === "cpp" && config.config?.doxyfile != null) {
        const doxyfilePath = resolve(docsDirectoryPath, config.config.doxyfile);
        try {
            doxyfileContent = await readFile(doxyfilePath, "utf-8");
        } catch {
            throw new CliError({
                message:
                    `Library '${name}': Could not read Doxyfile at '${config.config.doxyfile}' ` +
                    `(resolved to ${doxyfilePath})`,
                code: CliError.Code.ConfigError
            });
        }
    }

    const language = toLanguage(config.lang);
    if (language == null) {
        throw new CliError({
            message: `Library '${name}': unsupported language '${config.lang}'`,
            code: CliError.Code.ConfigError
        });
    }

    const ir = await generateIrLocally({
        context,
        name,
        config,
        docsDirectoryPath,
        language,
        doxyfileContent,
        wrapStep
    });

    if (language === "CPP") {
        const cppIr = ir as CppLibraryDocsIr;
        const result = generateCpp({
            ir: cppIr,
            outputDir: resolvedOutputPath,
            slug: name
        });
        context.logger.info(
            chalk.green(`Library '${name}': generated ${result.pageCount} pages at ${resolvedOutputPath}`)
        );
        context.logger.info(
            `\n  To include in your docs navigation, add to docs.yml:\n` +
                `    navigation:\n` +
                `      - folder: ${config.output.path}`
        );
    } else {
        const pythonIr = ir as FdrAPI.libraryDocs.PythonLibraryDocsIr;
        const generateResult = generate({
            ir: pythonIr,
            outputDir: resolvedOutputPath,
            slug: name,
            title: name
        });
        context.logger.info(
            chalk.green(`Library '${name}': generated ${generateResult.pageCount} pages at ${resolvedOutputPath}`)
        );
    }
}

/**
 * Produces the library-docs IR by running the parser Docker image locally.
 * Local paths are resolved relative to the docs directory; git inputs are
 * materialized at the configured branch, tag, or commit before parsing.
 */
async function generateIrLocally({
    context,
    name,
    config,
    docsDirectoryPath,
    language,
    doxyfileContent,
    wrapStep
}: {
    context: TaskContext;
    name: string;
    config: docsYml.RawSchemas.LibraryConfiguration;
    docsDirectoryPath: AbsoluteFilePath;
    language: LibraryLanguage;
    doxyfileContent: string | undefined;
    wrapStep: StepWrapper;
}): Promise<unknown> {
    let sourcePath: AbsoluteFilePath;
    let parserConfig: LocalParserConfig;

    if (isGitLibraryInput(config.input)) {
        const gitInput = config.input;
        const clonePath = await wrapStep({
            message: `Library '${name}': cloning ${gitInput.git}${gitInput.ref != null ? ` (ref: ${gitInput.ref})` : ""}`,
            operation: () => cloneRepositoryAtRef({ repositoryUrl: gitInput.git, ref: gitInput.ref })
        });
        if (gitInput.subpath != null) {
            resolveRepositorySubpath({
                repositoryRoot: clonePath,
                subpath: gitInput.subpath,
                description: `subpath for library '${name}'`
            });
        }
        // The parser reads the package at `packagePath` but resolves imports against the repo root.
        sourcePath = AbsoluteFilePath.of(clonePath);
        parserConfig = {
            packagePath: gitInput.subpath,
            sourceUrl: gitInput.git,
            branch: gitInput.ref,
            doxyfileContent
        };
    } else {
        sourcePath = resolve(docsDirectoryPath, config.input.path);
        parserConfig = { doxyfileContent };
    }

    const ir = await wrapStep({
        message: `Library '${name}': parsing library source locally`,
        operation: () => runLocalParser({ context, sourcePath, language, config: parserConfig })
    });
    validateLibraryIr(ir, language, name);
    return ir;
}

/**
 * Asserts that a parsed IR has the root node expected for its language so an
 * actionable error surfaces before the MDX generator runs.
 */
function validateLibraryIr(ir: unknown, language: LibraryLanguage, libraryName: string): void {
    if (ir == null) {
        throw new CliError({
            message: `IR is empty for library '${libraryName}'`,
            code: CliError.Code.InternalError
        });
    }

    if (language === "CPP") {
        if ((ir as { rootNamespace?: unknown }).rootNamespace == null) {
            throw new CliError({
                message: `IR has no rootNamespace for C++ library '${libraryName}'`,
                code: CliError.Code.InternalError
            });
        }
    } else if ((ir as { rootModule?: unknown }).rootModule == null) {
        throw new CliError({
            message: `IR has no rootModule for library '${libraryName}'`,
            code: CliError.Code.InternalError
        });
    }
}
