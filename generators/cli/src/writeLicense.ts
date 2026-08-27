/**
 * Emit the customer's LICENSE file into the generated CLI repo.
 *
 * Mirrors every other Fern generator (see `RustProject.writeLicenseFile`):
 * a LICENSE is written **only** when the customer configures one, and its
 * text always comes from the Fern CLI rather than being authored here. The
 * CLI mounts a `license: { type: custom, value: <path> }` file at
 * `/tmp/LICENSE`; a *basic* license (`license: MIT`) mounts nothing and
 * surfaces as package metadata only, which is what the other generators do.
 *
 * Before this existed the CLI generator was the fleet's outlier: `copySdk`
 * copies `./sdk/` verbatim, and `sdk/LICENSE` (the vendored runtime's
 * Apache-2.0 text) rode along into every generated repo. That contradicted
 * the `license` field `packageIdentity` writes into Cargo.toml — a repo
 * declaring `license = "MIT"` while shipping only an Apache-2.0 LICENSE.
 * `LICENSE` is now in `sdk/.sdk-ignore.json` so the copy no longer carries it.
 */
import { copyFile } from "fs/promises";
import path from "path";

/** Where the Fern CLI mounts a `type: custom` license file. */
const LICENSE_MOUNT_PATH = "/tmp/LICENSE";

/** Filename used when the license config doesn't name one. */
const DEFAULT_LICENSE_FILENAME = "LICENSE";

/**
 * The slice of `GeneratorConfig.license` this step consumes. Declared
 * structurally rather than importing the generated union so the step stays
 * testable without constructing a full `GeneratorConfig`.
 */
export interface LicenseConfigLike {
    type: string;
    filename?: string;
}

/**
 * Copy the configured license file into `outputDir`, returning the filename
 * written or `undefined` when there was nothing to write.
 *
 * A missing mount is not an error: on remote generation Fiddle writes the
 * LICENSE after the generator finishes, so the file legitimately isn't there.
 */
export async function writeLicense(args: {
    outputDir: string;
    license?: LicenseConfigLike;
}): Promise<string | undefined> {
    const { outputDir, license } = args;
    if (license?.type !== "custom") {
        return undefined;
    }

    const filename = license.filename ?? DEFAULT_LICENSE_FILENAME;
    try {
        await copyFile(LICENSE_MOUNT_PATH, path.join(outputDir, filename));
        return filename;
    } catch (error) {
        // `"code" in error` narrows to `Error & Record<"code", unknown>`, so the
        // comparison below needs no assertion.
        const code = error instanceof Error && "code" in error ? error.code : undefined;
        if (code === "ENOENT") {
            // Expected on remote generation — Fiddle writes it post-generation.
            return undefined;
        }
        throw error;
    }
}
