/* eslint-disable jest/no-disabled-tests */
import { AbsoluteFilePath, getDirectoryContents } from "@fern-api/fs-utils";
import { cp } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern generator upgrade", () => {
    it("fern generator upgrade", async () => {
        // Create tmpdir and copy contents
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(FIXTURES_DIR, directory, { recursive: true });

        await runFernCli(["generator", "upgrade", "--include-major"], {
            cwd: directory
        });

        const pythonVersion = await runFernCli(
            ["generator", "get", "--group", "python-sdk", "--generator", "fernapi/fern-python-sdk", "--version"],
            {
                cwd: directory
            }
        );

        expect(pythonVersion.stdout).not.toEqual("3.0.0");

        // Let's make sure that we don't touch the version if it's not found
        // TODO: remove this test when we register Java generators
        const javaVersion = await runFernCli(
            ["generator", "get", "--group", "local", "--generator", "fernapi/fern-java-sdk", "--version"],
            {
                cwd: directory
            }
        );

        expect(javaVersion.stdout).toEqual("0.0.1");
    }, 60_000);

    it("fern generator upgrade with filters", async () => {
        // Create tmpdir and copy contents
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(FIXTURES_DIR, directory, { recursive: true });

        await runFernCli(
            [
                "generator",
                "upgrade",
                "--group",
                "python-sdk",
                "--generator",
                "fernapi/fern-python-sdk",
                "--include-major"
            ],
            {
                cwd: directory
            }
        );

        const pythonVersion = await runFernCli(
            ["generator", "get", "--group", "python-sdk", "--generator", "fernapi/fern-python-sdk", "--version"],
            {
                cwd: directory
            }
        );

        expect(pythonVersion.stdout).not.toEqual("3.0.0");
    }, 60_000);

    it("fern generator help commands", async () => {
        // Create tmpdir and copy contents
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(FIXTURES_DIR, directory, { recursive: true });

        expect(
            (
                await runFernCli(["generator", "--help"], {
                    cwd: directory,
                    reject: false
                })
            ).stdout
        ).toMatchSnapshot();

        expect(
            (
                await runFernCli(["generator", "upgrade", "--help"], {
                    cwd: directory,
                    reject: false
                })
            ).stdout
        ).toMatchSnapshot();
    }, 60_000);

    it("fern generator upgrade majors", async () => {
        // Create tmpdir and copy contents
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(FIXTURES_DIR, directory, { recursive: true });

        await runFernCli(
            ["generator", "upgrade", "--group", "shouldnt-upgrade", "--generator", "fernapi/fern-python-sdk"],
            {
                cwd: directory
            }
        );

        const pythonVersion = await runFernCli(
            ["generator", "get", "--group", "shouldnt-upgrade", "--generator", "fernapi/fern-python-sdk", "--version"],
            {
                cwd: directory
            }
        );

        expect(pythonVersion.stdout).toEqual("2.16.0");

        await runFernCli(
            [
                "generator",
                "upgrade",
                "--group",
                "python-sdk",
                "--generator",
                "fernapi/fern-python-sdk",
                "--include-major"
            ],
            {
                cwd: directory
            }
        );

        const pythonVersionNewMajor = await runFernCli(
            ["generator", "get", "--group", "python-sdk", "--generator", "fernapi/fern-python-sdk", "--version"],
            {
                cwd: directory
            }
        );

        expect(pythonVersionNewMajor.stdout).not.toEqual("2.16.0");
    }, 60_000);
});
