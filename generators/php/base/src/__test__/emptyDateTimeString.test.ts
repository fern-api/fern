import { execFileSync } from "child_process";
import { Eta } from "eta";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

// ──────────────────────────────────────────────────────────────────────────────
// `JsonDeserializer::deserializeDateTime` is emitted into the generated SDK as
// PHP source, so the behavior that matters is the behavior of the rendered
// template — not of any TypeScript. This suite renders exactly what a consumer
// receives, for both settings of `rejectEmptyDateTimeStrings`, and executes it
// when a `php` binary is available.
//
// Why it matters: PHP's `DateTime` constructor treats "" as "construct for the
// current moment" and does NOT throw, so the template's catch never fires and
// the caller receives a plausible, entirely fabricated timestamp. The sibling
// `deserializeDate` already rejects "" (it uses `createFromFormat` and checks
// `=== false`), so the two were inconsistent for the same input.
// ──────────────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, "..", "asIs", "Json", "JsonDeserializer.Template.php");

// Must match `PhpProject`'s instance, or the rendering under test is not the
// rendering that ships.
const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

function render(rejectEmptyDateTimeStrings: boolean): string {
    return eta.renderString(readFileSync(TEMPLATE_PATH).toString(), {
        namespace: "Acme\\Core\\Json",
        coreNamespace: "Acme\\Core",
        rejectEmptyDateTimeStrings
    });
}

/**
 * Renders with only the variables the *model* generator supplies.
 *
 * `JsonDeserializer` is in `getCoreSerializationAsIsFiles`, so the model
 * generator emits it too — and `ModelGeneratorContext` supplies no extra
 * template vars. Under Eta's `useWith: true`, reading a missing *bare*
 * identifier raises rather than evaluating falsy, so a bare
 * `rejectEmptyDateTimeStrings` would abort model generation entirely. Every
 * other SDK-only flag in a shared template is read through `it.` for this
 * reason.
 */
function renderAsModelGenerator(): string {
    return eta.renderString(readFileSync(TEMPLATE_PATH).toString(), {
        namespace: "Acme\\Core\\Json",
        coreNamespace: "Acme\\Core"
    });
}

function hasPhp(): boolean {
    try {
        execFileSync("php", ["--version"], { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

describe("deserializeDateTime empty-string handling", () => {
    it("omits the guard by default, so flag-off output is unchanged", () => {
        const rendered = render(false);
        expect(rendered).not.toContain("Cannot create DateTime from an empty string");
        // The original body is intact: the constructor call is still the first
        // thing inside the try.
        expect(rendered).toMatch(/try \{\s*\n\s*return new DateTime\(\$datetime\);/);
    });

    it("emits the guard when the flag is on, before the constructor runs", () => {
        const rendered = render(true);
        expect(rendered).toContain("Cannot create DateTime from an empty string");
        // Order is the whole point: PHP's constructor does not throw on "", so a
        // check placed after it would never be reached.
        expect(rendered.indexOf("trim($datetime) === ''")).toBeLessThan(
            rendered.indexOf("return new DateTime($datetime)")
        );
    });

    it("renders for the model generator, which supplies no flag at all", () => {
        // Guards the `it.` prefix. With a bare identifier this throws and PHP
        // model packages cannot be generated.
        expect(() => renderAsModelGenerator()).not.toThrow();
        expect(renderAsModelGenerator()).not.toContain("Cannot create DateTime from an empty string");
    });

    it("leaves deserializeDate alone, which already rejected an empty string", () => {
        // Guards against "fixing" the sibling into throwing twice, or moving the
        // guard into the shared helper and changing date behavior too.
        for (const flag of [true, false]) {
            expect(render(flag)).toContain('throw new JsonException("Failed to create date from string: $date")');
        }
    });

    // Runtime proof. Skipped when no `php` binary is present (it is not part of
    // the devbox toolchain), so the assertions above are the floor in that case.
    describe.skipIf(!hasPhp())("executed against a real php binary", () => {
        function runDeserialize(rejectEmptyDateTimeStrings: boolean, input: string): string {
            const dir = mkdtempSync(join(tmpdir(), "fern-php-datetime-"));
            // Strip the namespace and the core `use` statements so the class can be
            // executed standalone; only DateTime/Exception/JsonException are needed.
            const source = render(rejectEmptyDateTimeStrings)
                .replace(/^namespace .*$/m, "")
                .replace(/^use Acme\\Core.*$/gm, "");
            const file = join(dir, "run.php");
            writeFileSync(
                file,
                `${source}\n` +
                    `try {\n` +
                    `    $d = JsonDeserializer::deserializeDateTime(${JSON.stringify(input)});\n` +
                    `    echo "OK:" . $d->format("Y");\n` +
                    `} catch (Throwable $e) {\n` +
                    `    echo "THREW:" . get_class($e);\n` +
                    `}\n`
            );
            try {
                return execFileSync("php", [file], { encoding: "utf-8" }).trim();
            } finally {
                rmSync(dir, { recursive: true, force: true });
            }
        }

        it("fabricates the current time when the flag is off", () => {
            const result = runDeserialize(false, "");
            expect(result).toContain("OK:");
        });

        it("raises on an empty string when the flag is on", () => {
            expect(runDeserialize(true, "")).toContain("THREW:");
        });

        it("still parses a real datetime with the flag on", () => {
            expect(runDeserialize(true, "2023-10-30 20:42:49")).toBe("OK:2023");
        });

        it("still raises on a malformed datetime, which already worked", () => {
            expect(runDeserialize(true, "not-a-date")).toContain("THREW:");
        });
    });
});
