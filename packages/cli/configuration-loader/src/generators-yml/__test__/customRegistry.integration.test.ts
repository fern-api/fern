import { loggingExeca } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const REGISTRY_PORT = "5052";
const REGISTRY_CONTAINER = "fern-test-registry-v1";
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

let dockerAvailable = false;
try {
    await docker(["info"], { reject: true });
    dockerAvailable = true;
} catch {
    dockerAvailable = false;
}

let registryUrl: string;
let fullImageRef: string;

describe.skipIf(!dockerAvailable)("Custom Registry Integration (v1)", () => {
    beforeAll(async () => {
        registryUrl = `localhost:${REGISTRY_PORT}`;
        fullImageRef = `${registryUrl}/fern-test-image:1.0.0`;

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

        for (let i = 0; i < 30; i++) {
            try {
                await docker(["exec", REGISTRY_CONTAINER, "wget", "-q", "--spider", "http://localhost:5000/v2/"], {
                    reject: true
                });
                break;
            } catch {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
        }

        await docker(["login", registryUrl, "-u", TEST_USER, "-p", TEST_PASS], { reject: true });
        await docker(["pull", "busybox:latest"], { reject: true });
        await docker(["tag", "busybox:latest", fullImageRef], { reject: true });
        await docker(["push", fullImageRef], { reject: true });
    }, 120_000);

    afterAll(async () => {
        await docker(["rm", "-f", REGISTRY_CONTAINER]);
        await docker(["logout", registryUrl]);
        await docker(["rmi", fullImageRef]);
    }, 30_000);

    it("v1 containerImage format pulls from authenticated registry", async () => {
        const containerImage = `${registryUrl}/fern-test-image`;
        const version = "1.0.0";
        const dockerImage = `${containerImage}:${version}`;

        await docker(["rmi", dockerImage]);

        const { exitCode } = await docker(["pull", dockerImage]);

        expect(exitCode).toBe(0);
    }, 30_000);

    it("v1 containerImage format fails without auth", async () => {
        await docker(["logout", registryUrl]);

        const dockerImage = `${registryUrl}/fern-test-image:1.0.0`;
        await docker(["rmi", dockerImage]);

        const { exitCode, stderr } = await docker(["pull", dockerImage]);

        expect(exitCode).not.toBe(0);
        expect(stderr).toMatch(/unauthorized|authentication required|denied/i);

        await docker(["login", registryUrl, "-u", TEST_USER, "-p", TEST_PASS], { reject: true });
    }, 30_000);
});
