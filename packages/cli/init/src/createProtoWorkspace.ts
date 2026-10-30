import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import fs from "fs-extra";
import path from "path";

import { analyzeProtoFile, chooseProtoTarget, findMissingImports, getProtoWarnings } from "./analyzeProto.js";
import { writeGrpcGeneratorsConfiguration } from "./createWorkspace.js";
import { SAMPLE_GRPC_PROTO_ROOT, SAMPLE_GRPC_SUPPORT_PROTOS } from "./sampleGrpcApi.js";

const PROTO_EXTENSION = ".proto";
const BUF_CONFIG_FILENAMES = ["buf.yaml", "buf.yml"];

/**
 * Creates a workspace from a proto the user already has, for `fern init --proto`.
 *
 * `protoPath` is either one `.proto` file or a directory of them. Either way the files are copied under
 * `<workspace>/proto`, the way `--openapi` copies its spec into the workspace, and `proto` becomes the root.
 * Problems that would make the SDK empty or fail to build are logged as warnings rather than errors,
 * because the files are still a reasonable starting point for the user to fix.
 */
export async function createProtoWorkspace({
    directoryOfWorkspace,
    protoPath,
    cliVersion,
    context
}: {
    directoryOfWorkspace: AbsoluteFilePath;
    protoPath: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
}): Promise<void> {
    const destinationRoot = join(directoryOfWorkspace, RelativeFilePath.of(SAMPLE_GRPC_PROTO_ROOT));
    await assertCanCopy({ protoPath, destinationRoot, context });

    const sourceIsDirectory = (await stat(protoPath)).isDirectory();
    if (sourceIsDirectory) {
        await warnAboutBufConfig({ directory: protoPath, context });
        await fs.copy(protoPath, destinationRoot, {
            filter: async (source) => (await stat(source)).isDirectory() || source.endsWith(PROTO_EXTENSION)
        });
    } else {
        await mkdir(destinationRoot, { recursive: true });
        await fs.copy(protoPath, path.join(destinationRoot, path.basename(protoPath)));
    }

    const relativePaths = await listProtoFiles(destinationRoot);
    if (relativePaths.length === 0) {
        context.failAndThrow(`No ${PROTO_EXTENSION} files were found in ${protoPath}`, undefined, {
            code: CliError.Code.ConfigError
        });
    }
    const files = await Promise.all(
        relativePaths.map(async (relativePath) =>
            analyzeProtoFile({
                relativePath,
                contents: await readFile(path.join(destinationRoot, relativePath), "utf8")
            })
        )
    );

    const existingPaths = new Set(relativePaths);
    const missingImports = findMissingImports({ files, existingPaths });
    const bundledProtosToWrite = getBundledProtosToWrite({ missingImports, existingPaths });
    if (bundledProtosToWrite.length > 0) {
        await writeBundledProtos({ destinationRoot, relativePaths: bundledProtosToWrite });
        context.logger.info(`Added the google/api protos your proto imports to ./${SAMPLE_GRPC_PROTO_ROOT}`);
    }
    const unresolvedImports = missingImports.filter((importPath) => !(importPath in SAMPLE_GRPC_SUPPORT_PROTOS));
    if (unresolvedImports.length > 0) {
        context.logger.warn(
            `These imports were not found under the proto root and will fail to compile: ${unresolvedImports.join(", ")}. ` +
                `Copy them into ./${SAMPLE_GRPC_PROTO_ROOT}, or add them as \`dependencies\` in generators.yml if they come from a buf module.`
        );
    }
    for (const warning of getProtoWarnings({ files })) {
        context.logger.warn(warning);
    }

    const relativeTarget = chooseProtoTarget({ files });
    await writeGrpcGeneratorsConfiguration({
        directoryOfWorkspace,
        cliVersion,
        context,
        protoRoot: SAMPLE_GRPC_PROTO_ROOT,
        protoTarget: relativeTarget != null ? `${SAMPLE_GRPC_PROTO_ROOT}/${relativeTarget}` : undefined
    });
}

async function assertCanCopy({
    protoPath,
    destinationRoot,
    context
}: {
    protoPath: AbsoluteFilePath;
    destinationRoot: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    const isInsideDestination = !path.relative(destinationRoot, protoPath).startsWith("..");
    if (isInsideDestination) {
        context.failAndThrow(
            `${protoPath} is already inside ${destinationRoot}, where fern init puts the proto. Move it elsewhere and try again.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    if (await doesPathExist(destinationRoot)) {
        context.failAndThrow(
            `${destinationRoot} already exists. Remove it or choose a different directory before running fern init --proto.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    if ((await stat(protoPath)).isFile() && !protoPath.endsWith(PROTO_EXTENSION)) {
        context.failAndThrow(
            `--proto expects a ${PROTO_EXTENSION} file or a directory, but got ${protoPath}`,
            undefined,
            {
                code: CliError.Code.ConfigError
            }
        );
    }
}

async function warnAboutBufConfig({
    directory,
    context
}: {
    directory: AbsoluteFilePath;
    context: TaskContext;
}): Promise<void> {
    for (const filename of BUF_CONFIG_FILENAMES) {
        if (await doesPathExist(join(directory, RelativeFilePath.of(filename)))) {
            context.logger.warn(
                `Found ${filename} in ${directory}. It was not copied: Fern writes its own buf config, ` +
                    "so any buf `deps` have to be listed as `dependencies` in generators.yml."
            );
        }
    }
}

/**
 * The bundled protos that are imported but missing, plus the bundled protos those import in turn
 * (annotations.proto imports http.proto). Files the user already has are never included.
 */
function getBundledProtosToWrite({
    missingImports,
    existingPaths
}: {
    missingImports: string[];
    existingPaths: ReadonlySet<string>;
}): string[] {
    const toWrite = new Set<string>();
    const pending = [...missingImports];
    let relativePath: string | undefined;
    while ((relativePath = pending.pop()) != null) {
        const contents = SAMPLE_GRPC_SUPPORT_PROTOS[relativePath];
        if (contents == null || toWrite.has(relativePath) || existingPaths.has(relativePath)) {
            continue;
        }
        toWrite.add(relativePath);
        pending.push(...analyzeProtoFile({ relativePath, contents }).imports);
    }
    return [...toWrite].sort();
}

async function writeBundledProtos({
    destinationRoot,
    relativePaths
}: {
    destinationRoot: AbsoluteFilePath;
    relativePaths: string[];
}): Promise<void> {
    for (const relativePath of relativePaths) {
        const contents = SAMPLE_GRPC_SUPPORT_PROTOS[relativePath];
        if (contents == null) {
            continue;
        }
        const filepath = path.join(destinationRoot, relativePath);
        await mkdir(path.dirname(filepath), { recursive: true });
        // "wx" fails instead of truncating if the file somehow exists.
        await writeFile(filepath, contents, { flag: "wx" });
    }
}

/** Paths of every `.proto` file under `directory`, relative to it and with forward slashes. */
async function listProtoFiles(directory: AbsoluteFilePath): Promise<string[]> {
    const found: string[] = [];
    const walk = async (relativeDirectory: string): Promise<void> => {
        const entries = await readdir(path.join(directory, relativeDirectory), { withFileTypes: true });
        for (const entry of entries) {
            const relativePath = path.posix.join(relativeDirectory, entry.name);
            if (entry.isDirectory()) {
                await walk(relativePath);
            } else if (entry.name.endsWith(PROTO_EXTENSION) && (await isFile(path.join(directory, relativePath)))) {
                found.push(relativePath);
            }
        }
    };
    await walk("");
    return found.sort();
}

/** True for regular files, including symlinks to them. */
async function isFile(filepath: string): Promise<boolean> {
    return (await stat(filepath)).isFile();
}
