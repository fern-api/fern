import { loggingExeca } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

export interface LocalRegistry {
    /** Registry URL (e.g., "localhost:5000") */
    url: string;
    /** The test image name pushed to the registry */
    testImage: string;
    /** The test image tag */
    testTag: string;
    /** Full image reference: url/testImage:testTag */
    fullImageRef: string;
    /** Log out from the registry (for testing auth failure) */
    logout: () => Promise<void>;
    /** Log back in to the registry */
    login: () => Promise<void>;
    /** Tear down the registry container and clean up */
    cleanup: () => Promise<void>;
}

const REGISTRY_PORT = "5051";
const REGISTRY_CONTAINER = "fern-test-registry";
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

export async function startLocalRegistry(): Promise<LocalRegistry> {
    const url = `localhost:${REGISTRY_PORT}`;
    const testImage = "fern-test-image";
    const testTag = "1.0.0";
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

    await docker(["pull", "busybox:latest"], { reject: true });
    await docker(["tag", "busybox:latest", fullImageRef], { reject: true });
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
        try {
            await docker(["exec", REGISTRY_CONTAINER, "wget", "-q", "--spider", "http://localhost:5000/v2/"], {
                reject: true
            });
            return;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
    throw new Error(`Registry did not become ready within ${maxRetries * 0.5}s`);
}

export async function isDockerAvailable(): Promise<boolean> {
    try {
        await loggingExeca(undefined, "docker", ["info"], { doNotPipeOutput: true, reject: true });
        return true;
    } catch {
        return false;
    }
}
