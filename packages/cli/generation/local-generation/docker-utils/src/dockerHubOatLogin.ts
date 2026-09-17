import { ContainerRunner } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";

/**
 * Docker Hub organization access token for the private namespace Fern's enterprise images are
 * published under. Same variable name self-hosted Fern Docs documents, so a customer who already
 * self-hosts docs sets the credential they already have.
 */
export const DOCKERHUB_OAT_ENV_VAR = "DOCKERHUB_OAT";

/**
 * Overrides the Docker Hub organization the token belongs to. An OAT authenticates *as* the
 * organization, so the username is the namespace, which is also what makes this the gate: the token
 * is only ever sent for an image published under that exact namespace.
 */
export const DOCKERHUB_OAT_USERNAME_ENV_VAR = "DOCKERHUB_OAT_USERNAME";

const DEFAULT_DOCKERHUB_OAT_USERNAME = "fernenterprise";

/** Registry hosts that address Docker Hub, all of which an OAT is valid against. */
const DOCKER_HUB_HOSTS: ReadonlySet<string> = new Set([
    "docker.io",
    "index.docker.io",
    "registry-1.docker.io",
    "registry.hub.docker.com"
]);

/**
 * The Docker Hub namespace an image reference resolves to, or `undefined` if it does not name one:
 * an official library image (`alpine:3`), or an image on some other registry (`ghcr.io/acme/img`).
 *
 * A mirrored image on a customer's own registry is deliberately excluded — the credential is scoped
 * to Docker Hub, and a run against a private mirror authenticates however that mirror requires.
 */
export function getDockerHubNamespace(imageName: string): string | undefined {
    const parts = imageName.split("/");
    const [first] = parts;
    if (first == null || parts.length < 2) {
        return undefined;
    }

    // A first segment carrying a dot, a port, or `localhost` is a registry host rather than a
    // namespace, which is the same rule the Docker CLI applies.
    const isRegistryHost = first.includes(".") || first.includes(":") || first === "localhost";
    if (!isRegistryHost) {
        return first;
    }
    if (!DOCKER_HUB_HOSTS.has(first)) {
        return undefined;
    }
    return parts.length >= 3 ? parts[1] : undefined;
}

export declare namespace resolveDockerHubOatLogin {
    interface Credentials {
        username: string;
        token: string;
    }
}

/**
 * The credentials to log in with before pulling `imageName`, or `undefined` to leave whatever
 * credentials Docker already holds untouched.
 *
 * Absence is the ordinary case: no token set, or an image outside the organization's namespace. It
 * is not an error, because an interactive `docker login` remains a perfectly good way to
 * authenticate and is what a customer without this variable set will have done.
 */
export function resolveDockerHubOatLogin(
    imageName: string,
    env: NodeJS.ProcessEnv = process.env
): resolveDockerHubOatLogin.Credentials | undefined {
    const token = env[DOCKERHUB_OAT_ENV_VAR]?.trim();
    if (token == null || token === "") {
        return undefined;
    }
    const username = env[DOCKERHUB_OAT_USERNAME_ENV_VAR]?.trim() || DEFAULT_DOCKERHUB_OAT_USERNAME;
    if (getDockerHubNamespace(imageName) !== username) {
        return undefined;
    }
    return { username, token };
}

/**
 * Logins already performed in this process, keyed by runner and organization, so a run that pulls
 * several images authenticates once.
 *
 * The promise is cached rather than a boolean so concurrent pulls await the same login instead of
 * racing two of them. A failed login is not cached, so a retry can succeed.
 */
const loginsInFlight = new Map<string, Promise<void>>();

/**
 * Authenticates to Docker Hub with the organization access token, if one is set and this image needs
 * it. No-ops otherwise.
 *
 * Called before pulling rather than once at startup because the decision depends on which image is
 * being pulled: a workspace that runs only Fern's public generators never sends the token anywhere.
 */
export async function ensureDockerHubOatLogin({
    imageName,
    runner,
    logger,
    env = process.env
}: {
    imageName: string;
    runner?: ContainerRunner;
    logger?: Logger;
    env?: NodeJS.ProcessEnv;
}): Promise<void> {
    const credentials = resolveDockerHubOatLogin(imageName, env);
    if (credentials == null) {
        return;
    }

    const containerRunner = runner ?? "docker";
    const key = `${containerRunner}:${credentials.username}`;
    const existing = loginsInFlight.get(key);
    if (existing != null) {
        return existing;
    }

    const login = (async () => {
        logger?.debug(
            `Logging in to Docker Hub as ${credentials.username} with ${DOCKERHUB_OAT_ENV_VAR} to pull ${imageName}`
        );
        const { exitCode, stdout, stderr } = await loggingExeca(
            logger,
            containerRunner,
            ["login", "--username", credentials.username, "--password-stdin"],
            {
                input: credentials.token,
                reject: false,
                doNotPipeOutput: true,
                secrets: [credentials.token]
            }
        );
        if (exitCode !== 0) {
            throw new Error(
                `Failed to log in to Docker Hub as ${credentials.username} using ${DOCKERHUB_OAT_ENV_VAR}. ` +
                    `Check that the token is a valid organization access token for ${credentials.username} with pull access to ${imageName}.\n` +
                    `${stdout}\n${stderr}`
            );
        }
    })();

    loginsInFlight.set(key, login);
    try {
        await login;
    } catch (error) {
        loginsInFlight.delete(key);
        throw error;
    }
}

/** Test-only: drops the memoized logins so each test starts from an unauthenticated process. */
export function resetDockerHubOatLoginsForTest(): void {
    loginsInFlight.clear();
}
