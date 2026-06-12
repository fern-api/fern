import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { runContainer } from "@fern-api/docker-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError, type TaskContext } from "@fern-api/task-context";

import tmp from "tmp-promise";

import type { LibraryLanguage } from "./orchestrate.js";

/**
 * Docker images that parse library source into library-docs IR. These mirror
 * the parsers that run server-side for the remote (FDR) generation path, and
 * follow the `fernapi/fern-*` Docker Hub convention used by the SDK generators.
 */
const PARSER_IMAGES: Record<LibraryLanguage, string> = {
    PYTHON: "fernapi/fern-python-library-docs-parser",
    CPP: "fernapi/fern-cpp-library-docs-parser"
};

/**
 * Tag used for the parser images. `latest` is intentional: the CLI always runs
 * the newest published parser (see the force-pull in {@link runLocalParser}).
 * There is deliberately no user-facing version override yet.
 */
const PARSER_IMAGE_TAG = "latest";

/**
 * Per-language env vars that override the parser image (e.g. a locally-built
 * `:local` tag), bypassing the default. Intended for development before the
 * images are published to Docker Hub.
 */
const PARSER_IMAGE_ENV_VARS: Record<LibraryLanguage, string> = {
    PYTHON: "FERN_PYTHON_PARSER_IMAGE",
    CPP: "FERN_CPP_PARSER_IMAGE"
};

function getParserImage(language: LibraryLanguage): string {
    const override = process.env[PARSER_IMAGE_ENV_VARS[language]];
    if (override != null && override.trim() !== "") {
        return override;
    }
    return `${PARSER_IMAGES[language]}:${PARSER_IMAGE_TAG}`;
}

/**
 * Command that selects the parser images' CLI entry point. The images' default
 * CMD (`src.handler.handler`) boots the AWS Lambda runtime; passing this command
 * makes the dual-mode entrypoint exec the local CLI instead.
 */
const PARSER_CLI_COMMAND = ["python", "-m", "src.cli_entrypoint"];

/** Parser configuration written to `/input/config.json` for the container. */
export interface LocalParserConfig {
    /** Path within the mounted repo to the package source (maps to the remote `packagePath`). */
    packagePath?: string;
    /** Source repository URL, embedded in the IR for source links. */
    sourceUrl?: string;
    /** Contents of a Doxyfile, used only by the C++ parser. */
    doxyfileContent?: string;
}

/**
 * Runs a library parser Docker image locally and returns the parsed IR.
 *
 * The container contract mirrors the server-side parsers:
 *   - the library source is mounted read-only at `/repo`
 *   - parser configuration is mounted read-only at `/input/config.json`
 *   - the container writes `{ ir, metadata }` to `/output/ir.json`
 *
 * Returns the unwrapped `ir` (matching the remote download path); callers are
 * responsible for validating its shape (see `validateLibraryIr` in `orchestrate`).
 */
export async function runLocalParser({
    context,
    sourcePath,
    language,
    config
}: {
    context: TaskContext;
    /** Absolute path to the library source directory mounted into the container as `/repo`. */
    sourcePath: AbsoluteFilePath;
    language: LibraryLanguage;
    config: LocalParserConfig;
}): Promise<unknown> {
    const imageName = getParserImage(language);

    const outputDir = await tmp.dir({ unsafeCleanup: true });
    const configFile = await tmp.file({ postfix: ".json" });

    try {
        await writeFile(
            configFile.path,
            JSON.stringify({
                packagePath: config.packagePath,
                sourceUrl: config.sourceUrl,
                doxyfileContent: config.doxyfileContent
            })
        );

        await runContainer({
            logger: context.logger,
            imageName,
            args: PARSER_CLI_COMMAND,
            binds: [`${sourcePath}:/repo:ro`, `${outputDir.path}:/output`, `${configFile.path}:/input/config.json:ro`],
            removeAfterCompletion: true,
            // `latest` is a mutable tag, so force a pull to avoid reusing a stale local copy.
            // Immutable tags (e.g. a `:local` dev build via the env override) keep the
            // default pull-when-missing behavior.
            pull: imageName.endsWith(`:${PARSER_IMAGE_TAG}`)
        });

        const irPath = join(outputDir.path, "ir.json");
        let irContents: string;
        try {
            irContents = await readFile(irPath, "utf-8");
        } catch {
            throw new CliError({
                message: `Local parser (${imageName}) did not produce IR at ${irPath}`,
                code: CliError.Code.InternalError
            });
        }

        const result = JSON.parse(irContents) as { ir?: unknown };
        return result.ir;
    } finally {
        await configFile.cleanup();
        await outputDir.cleanup();
    }
}
