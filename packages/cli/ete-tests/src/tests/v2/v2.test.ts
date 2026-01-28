import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { writeFile } from "fs/promises";
import { join } from "path";
import tmp from "tmp-promise";
import { describe, expect, it } from "vitest";
import { runFernCli } from "../../utils/runFernCli";

const VALID_FERN_YML = `edition: 2026-01-01
org: acme

cli:
  version: 3.38.0

sdks:
  autorelease: true
  targets:
    typescript:
      lang: typescript
      version: "1.0.0"
      output:
        path: ./sdks/typescript
`;

const INVALID_FERN_YML = `org: 12345`;

describe("fern beta", () => {
    it("fern check (success)", async () => {
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);
        await writeFile(join(tmpDir.path, "fern.yml"), VALID_FERN_YML);

        const { stdout } = await runFernCli(["beta", "check"], {
            cwd: directory
        });
        expect(stdout).to.be.empty;
    });

    it("fern check (failure)", async () => {
        const tmpDir = await tmp.dir();
        const directory = AbsoluteFilePath.of(tmpDir.path);
        await writeFile(join(tmpDir.path, "fern.yml"), INVALID_FERN_YML);

        const { stdout, stderr, exitCode } = await runFernCli(["beta", "check"], {
            cwd: directory,
            reject: false
        });
        expect(exitCode).to.equal(1);
        expect(stdout).to.be.empty;
        expect(stderr).to.contain("fern.yml:1:1: edition is required");
        expect(stderr).to.contain("fern.yml:1:6: org must be a string");
    });
}, 90_000);
