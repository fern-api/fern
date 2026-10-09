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
import { copyFile, writeFile } from "fs/promises";
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
    /** `type: "custom"` — the filename to write the mounted file to. */
    filename?: string;
    /**
     * `type: "basic"` — an SPDX id the CLI enumerates (`MIT` / `Apache-2.0`).
     *
     * The union is open (`string & {}`) rather than closed: this mirrors an
     * upstream config value, so a new id appearing there must not fail to
     * typecheck here. Naming the two known ids still lets the compiler catch
     * the `id !== "MIT"` branch drifting.
     */
    id?: "MIT" | "Apache-2.0" | (string & {});
}

/**
 * Full text for the SPDX ids Fern's `LicenseConfig.Basic` enumerates.
 *
 * A `basic` license mounts no file — `extractLicenseFilePath` in the Fern CLI
 * returns `undefined` for it — so a generator that wants to honor
 * `license: MIT` has to carry the text. Only two ids are possible, so this is
 * bounded rather than an open-ended licence database.
 *
 * MIT needs a copyright line and Apache-2.0 does not, which is why only the
 * former is templated.
 */
const MIT_TEMPLATE = `MIT License

Copyright (c) {{YEAR}} {{HOLDER}}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

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
    /**
     * Copyright holder for a `basic` MIT license. First
     * `packageIdentity.authors` entry, else the Fern organization name. When
     * neither is known no LICENSE is written: a copyright line naming the wrong
     * party — or nobody — is worse than none at all.
     */
    copyrightHolder?: string;
    /** Current year, injected so the caller owns the clock. */
    year?: number;
}): Promise<string | undefined> {
    const { outputDir, license, copyrightHolder, year } = args;

    // `license: MIT` in generators.yml. The CLI mounts nothing for this, so the
    // text has to come from here. Without it a public repo publishing to npm as
    // MIT shipped no LICENSE at all.
    if (license?.type === "basic") {
        return writeBasicLicense({ outputDir, id: license.id, copyrightHolder, year });
    }
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

/** Write the text for a `basic` license id; `undefined` when it can't be. */
async function writeBasicLicense(args: {
    outputDir: string;
    id: string | undefined;
    copyrightHolder: string | undefined;
    year: number | undefined;
}): Promise<string | undefined> {
    const { outputDir, id, copyrightHolder, year } = args;
    if (id !== "MIT") {
        // Apache-2.0 (the only other enumerated id) is ~11 KB of unmodified
        // boilerplate; the vendored runtime already ships a copy, and emitting
        // a second one under the customer's name would misattribute it. Left to
        // `license: { type: custom }` deliberately.
        return undefined;
    }
    const holder = copyrightHolder?.trim();
    if (holder == null || holder === "") {
        return undefined;
    }
    // Function replacements, not string ones: `String.prototype.replace` treats
    // `$&`, `$'` and `` $` `` in the *replacement* as capture references, so a
    // holder like `Acme $& Co` would expand to the matched text and emit
    // `Acme {{HOLDER}} Co`. A function replacement is passed through verbatim.
    const text = MIT_TEMPLATE.replace("{{YEAR}}", () => String(year ?? new Date().getFullYear())).replace(
        "{{HOLDER}}",
        () => holder
    );
    await writeFile(path.join(outputDir, DEFAULT_LICENSE_FILENAME), text, "utf-8");
    return DEFAULT_LICENSE_FILENAME;
}
