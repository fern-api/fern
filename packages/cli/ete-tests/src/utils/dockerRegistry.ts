import { loggingExeca } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

export interface LocalRegistry {
    url: string;
    testImage: string;
    testTag: string;
    fullImageRef: string;
    logout: () => Promise<void>;
    login: () => Promise<void>;
    cleanup: () => Promise<void>;
}

const REGISTRY_PORT = "5053";
const REGISTRY_CONTAINER = "fern-ete-test-registry";
const TEST_USER = "testuser";
const TEST_PASS = "testpass";

async function docker(
    args: string[],
    options: { reject?: boolean } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
    return loggingExeca(undefined, "docker", args, {
        doNotPipeOutput: true,
        reject: options.reject ?? false
    });
}

export async function isDockerAvailable(): Promise<boolean> {
    try {
        await docker(["info"], { reject: true });
        return true;
    } catch {
        return false;
    }
}

export async function startLocalRegistry(sourceImage: string): Promise<LocalRegistry> {
    const url = `localhost:${REGISTRY_PORT}`;
    // Parse the source image to preserve its name and tag in the local registry.
    // e.g. "fernapi/fern-typescript-sdk:3.60.9" → image "fernapi/fern-typescript-sdk", tag "3.60.9"
    const [imagePart, tagPart] = sourceImage.split(":");
    const testImage = imagePart ?? sourceImage;
    const testTag = tagPart ?? "latest";
    const fullImageRef = `${url}/${testImage}:${testTag}`;

    const htpasswdDir = await tmp.dir({ unsafeCleanup: true });
    const { stdout: htpasswdContent } = await docker(
        ["run", "--rm", "--entrypoint", "htpasswd", "httpd:2", "-Bbn", TEST_USER, TEST_PASS],
        { reject: true }
    );
    await writeFile(`${htpasswdDir.path}/htpasswd`, htpasswdContent);

    await docker(["rm", "-f", REGISTRY_CONTAINER]);

    await docker(
        [
            "run",
            "-d",
            "-p",
            `${REGISTRY_PORT}:5000`,
            "--name",
            REGISTRY_CONTAINER,
            "-e",
            "REGISTRY_AUTH=htpasswd",
            "-e",
            "REGISTRY_AUTH_HTPASSWD_REALM=Test Registry",
            "-e",
            "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd",
            "-v",
            `${htpasswdDir.path}/htpasswd:/auth/htpasswd:ro`,
            "registry:2"
        ],
        { reject: true }
    );

    await waitForRegistry();

    const login = async (): Promise<void> => {
        await docker(["login", url, "-u", TEST_USER, "-p", TEST_PASS], { reject: true });
    };
    await login();

    await docker(["pull", sourceImage], { reject: true });
    await docker(["tag", sourceImage, fullImageRef], { reject: true });
    await docker(["push", fullImageRef], { reject: true });

    const logout = async (): Promise<void> => {
        await docker(["logout", url]);
    };

    const cleanup = async (): Promise<void> => {
        await docker(["rm", "-f", REGISTRY_CONTAINER]);
        await logout();
        await docker(["rmi", fullImageRef]);
        htpasswdDir.cleanup();
    };

    return { url, testImage, testTag, fullImageRef, logout, login, cleanup };
}

async function waitForRegistry(maxRetries = 30): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
        const result = await docker([
            "exec",
            REGISTRY_CONTAINER,
            "wget",
            "-q",
            "-O",
            "/dev/null",
            "http://localhost:5000/v2/"
        ]);
        const output = result.stdout + result.stderr;
        if (result.exitCode === 0 || output.includes("401") || output.includes("Unauthorized")) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error(`Registry did not become ready within ${maxRetries * 0.5}s`);
}
