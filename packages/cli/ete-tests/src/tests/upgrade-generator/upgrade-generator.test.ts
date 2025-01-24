/* eslint-disable jest/no-disabled-tests */
import { cp, readFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { AbsoluteFilePath, RelativeFilePath, getDirectoryContents, join } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern generator upgrade", () => {
    it("fern generator upgrade", async () => {
        // Create tmpdir and copy contents
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(FIXTURES_DIR, directory, { recursive: true });

        await runFernCli(["generator", "upgrade"], {
            cwd: directory
        });

        const outputFile = join(directory, RelativeFilePath.of("version.txt"));
        await runFernCli(
            [
                "generator",
                "get",
                "--group",
                "python-sdk",
                "--generator",
                "fernapi/fern-python-sdk",
                "--version",
                "-o",
                outputFile
            ],
            {
                cwd: directory
            }
        );

        expect(JSON.parse((await readFile(outputFile)).toString()).version).not.toEqual("3.0.0");
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

        const outputFile = join(directory, RelativeFilePath.of("version.txt"));
        await runFernCli(
            [
                "generator",
                "get",
                "--group",
                "python-sdk",
                "--generator",
                "fernapi/fern-python-sdk",
                "--version",
                "-o",
                outputFile
            ],
            {
                cwd: directory
            }
        );

        expect(JSON.parse((await readFile(outputFile)).toString()).version).not.toEqual("3.0.0");
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

        const outputFile = join(directory, RelativeFilePath.of("version.txt"));
        await runFernCli(
            [
                "generator",
                "get",
                "--group",
                "shouldnt-upgrade",
                "--generator",
                "fernapi/fern-python-sdk",
                "--version",
                "-o",
                outputFile
            ],
            {
                cwd: directory
            }
        );

        expect(JSON.parse((await readFile(outputFile)).toString()).version).toEqual("2.16.0");

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

        const outputFileNewMajor = join(directory, RelativeFilePath.of("version-new.txt"));
        await runFernCli(
            [
                "generator",
                "get",
                "--group",
                "python-sdk",
                "--generator",
                "fernapi/fern-python-sdk",
                "--version",
                "-o",
                outputFileNewMajor
            ],
            {
                cwd: directory
            }
        );

        expect(JSON.parse((await readFile(outputFileNewMajor)).toString()).version).not.toEqual("2.16.0");
    }, 60_000);

    it("fern generator upgrade list", async () => {
        // Create tmpdir and copy contents
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(FIXTURES_DIR, directory, { recursive: true });

        expect(
            (
                await runFernCli(
                    [
                        "generator",
                        "upgrade",
                        "--group",
                        "python-sdk",
                        "--generator",
                        "fernapi/fern-python-sdk",
                        "--include-major",
                        "--list"
                    ],
                    {
                        cwd: directory
                    }
                )
            ).stdout
        ).toMatchSnapshot();
    }, 60_000);

    it.skip("fern generator upgrade message", async () => {
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);

        await cp(FIXTURES_DIR, directory, { recursive: true });

        const outputFileNewMajor = join(directory, RelativeFilePath.of("version-new.txt"));

        expect(
            (
                await runFernCli(
                    [
                        "generator",
                        "get",
                        "--group",
                        "python-sdk",
                        "--generator",
                        "fernapi/fern-python-sdk",
                        "--version",
                        "-o",
                        outputFileNewMajor
                    ],
                    {
                        cwd: directory
                    }
                )
            ).stdout
        ).toMatchSnapshot();
    }, 60_000);
});
