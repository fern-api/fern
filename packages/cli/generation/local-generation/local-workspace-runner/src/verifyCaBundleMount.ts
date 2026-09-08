import { ContainerRunner, FERN_CA_BUNDLE_ENV_VAR } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { statSync } from "fs";

const PROBE_CONTAINER_PATH = "/probe";

/**
 * Docker/podman refusing the bind outright. Docker Desktop rejects paths outside its
 * file-sharing allowlist; `--mount`-style errors surface when the source is absent on
 * the daemon's filesystem.
 */
const MOUNT_ERROR_PATTERN = /mounts denied|invalid mount config|bind source path does not exist/i;

/**
 * The runtime could not be reached at all, so nothing can be concluded about the mount.
 * This has to be matched on the message: the CLI exits 1 for a connection failure, the same
 * code the container's own command uses, so the exit code alone cannot separate the two.
 */
const RUNTIME_UNREACHABLE_PATTERN =
    /cannot connect to the docker daemon|error during connect|is the docker daemon running|cannot connect to podman|unable to connect to podman/i;

/**
 * Docker and podman reserve 125-127 for their own failures (daemon error, entrypoint not
 * executable, entrypoint not found). Exit 1 otherwise means our shell really ran and
 * `test -f` failed — the bundle is not there. Keying off the exit code rather than the
 * message keeps this robust when stderr also carries unrelated noise, such as the
 * "Unable to find image ... locally" notice printed during a pull.
 */
const CONTAINER_COMMAND_FAILED = 1;

/** Successful verifications, keyed by runner + image + host path. */
const verified = new Set<string>();

/**
 * Confirms the CA bundle is actually visible inside a container before generation starts.
 *
 * `getCaBundleMount` can only check the *CLI's* filesystem, but the bind source is resolved
 * by the container runtime. When those differ the mount fails loudly on Docker Desktop
 * ("mounts denied") and silently everywhere else: `-v` fabricates an empty directory at the
 * source, so the container sees a directory where the bundle should be and TLS fails later
 * with an unrelated-looking error. Probing costs one short-lived container against an image
 * that is already local, and only runs when FERN_CA_BUNDLE is set.
 */
export async function verifyCaBundleMount({
    hostPath,
    imageName,
    runner,
    logger
}: {
    hostPath: string;
    imageName: string;
    runner: ContainerRunner;
    logger: Logger;
}): Promise<void> {
    const cacheKey = `${runner}\u0000${imageName}\u0000${hostPath}`;
    if (verified.has(cacheKey)) {
        return;
    }

    const expectedBytes = statSync(hostPath).size;
    const { stdout, stderr, exitCode } = await loggingExeca(
        logger,
        runner,
        [
            "run",
            "--rm",
            "--user",
            "root",
            "--entrypoint",
            "sh",
            "-v",
            `${hostPath}:${PROBE_CONTAINER_PATH}:ro`,
            imageName,
            "-c",
            `test -f ${PROBE_CONTAINER_PATH} && wc -c < ${PROBE_CONTAINER_PATH}`
        ],
        { reject: false, doNotPipeOutput: true }
    );

    if (exitCode === 0) {
        const observedBytes = Number.parseInt(stdout.trim(), 10);
        if (Number.isFinite(observedBytes) && observedBytes === expectedBytes) {
            verified.add(cacheKey);
            return;
        }
        throw new Error(
            explainCaBundleMountFailure({
                hostPath,
                imageName,
                runner,
                detail: `the container saw ${Number.isFinite(observedBytes) ? `${observedBytes} bytes` : "unexpected content"} at ${PROBE_CONTAINER_PATH}, but the file is ${expectedBytes} bytes on this machine`
            })
        );
    }

    // Only block generation when we are confident the mount itself is at fault: either the
    // runtime refused the bind, or the container ran and did not find a file there. Anything
    // else (missing runner binary, image that cannot start, daemon hiccup) is a problem with
    // the probe, and `runContainer` will report it a moment later far more accurately.
    const refusedByRuntime = MOUNT_ERROR_PATTERN.test(stderr);
    const ranButFoundNothing = exitCode === CONTAINER_COMMAND_FAILED && !RUNTIME_UNREACHABLE_PATTERN.test(stderr);
    if (!refusedByRuntime && !ranButFoundNothing) {
        logger.warn(
            `Could not verify that ${FERN_CA_BUNDLE_ENV_VAR} (${hostPath}) is visible inside the generator container; continuing anyway.`
        );
        verified.add(cacheKey);
        return;
    }

    throw new Error(
        explainCaBundleMountFailure({
            hostPath,
            imageName,
            runner,
            detail: refusedByRuntime
                ? (stderr.trim().split("\n")[0] ?? stderr.trim())
                : `nothing was visible at ${PROBE_CONTAINER_PATH} inside the container`
        })
    );
}

/**
 * The remedy differs per platform, so lead with the observed fact and only then explain.
 * `DOCKER_HOST` is checked first: a remote daemon behaves the same way on every OS, and a
 * Linux CI box driving a remote or Docker-in-Docker daemon needs that answer rather than
 * the Linux one.
 */
export function explainCaBundleMountFailure({
    hostPath,
    imageName,
    runner,
    detail,
    platform = process.platform,
    dockerHost = process.env.DOCKER_HOST
}: {
    hostPath: string;
    imageName: string;
    runner: ContainerRunner;
    detail: string;
    platform?: NodeJS.Platform;
    dockerHost?: string;
}): string {
    const reproduce =
        `\n\nReproduce directly:\n` +
        `  ${runner} run --rm -v "${hostPath}:${PROBE_CONTAINER_PATH}:ro" ${imageName} head -c 27 ${PROBE_CONTAINER_PATH}`;

    const head = `${FERN_CA_BUNDLE_ENV_VAR} (${hostPath}) could not be mounted into the generator container: ${detail}.`;

    if (dockerHost != null && dockerHost.trim() !== "") {
        return (
            `${head}\n\n` +
            `DOCKER_HOST is set to ${dockerHost}, so the container runtime is not on this machine. ` +
            `The bind source is resolved by the runtime, not by the CLI, so ${FERN_CA_BUNDLE_ENV_VAR} must ` +
            `name a path the runtime host can see. On a Docker-in-Docker sidecar, place the bundle on a ` +
            `volume shared with the daemon (under $RUNNER_TEMP on Actions Runner Controller).` +
            reproduce
        );
    }

    if (platform === "darwin") {
        return (
            `${head}\n\n` +
            `On macOS the container runtime runs in a VM and shares only some host directories:\n` +
            `  Docker Desktop   /Users, /Volumes, /private, /tmp   (Settings > Resources > File Sharing)\n` +
            `  Colima           $HOME, /tmp/colima                 (colima.yaml "mounts:", then colima restart)\n` +
            `  podman machine   $HOME                              (podman machine init -v source:target)\n\n` +
            `Copy the bundle somewhere under your home directory and point ${FERN_CA_BUNDLE_ENV_VAR} at the copy, ` +
            `or share this path with your runtime. A symlink under $HOME pointing outside it will not work, ` +
            `because the link is resolved inside the VM.` +
            reproduce
        );
    }

    if (platform === "win32") {
        return (
            `${head}\n\n` +
            `On Windows the container runtime runs in WSL2 or a Hyper-V VM. Use a Windows path on a shared ` +
            `drive (for example C:\\Users\\you\\certs\\ca-bundle.crt); UNC and \\\\wsl$\\ paths are not valid ` +
            `bind sources. With the Hyper-V backend, enable the drive under Settings > Resources > File Sharing.` +
            reproduce
        );
    }

    return (
        `${head}\n\n` +
        `On Linux the container runtime shares this filesystem, so this is usually one of:\n` +
        `  - the file is not readable by the user running ${runner} (rootless ${runner})\n` +
        `  - SELinux is blocking the bind (check "ausearch -m avc"). Do not add :z or :Z to a system\n` +
        `    certificate file, as relabeling it can break tooling on the host.\n` +
        `  - the daemon is not local after all (check "${runner} context ls")` +
        reproduce
    );
}
