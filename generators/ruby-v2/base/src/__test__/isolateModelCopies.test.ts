import { Eta } from "eta";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });
function render(path: string, isolateModelCopies: boolean): string {
    return eta.renderString(readFileSync(join(__dirname, "../asIs", path), "utf8"), {
        gem_namespace: "Seed",
        omitUnsetModelFields: false,
        isolateModelCopies
    });
}
describe("isolateModelCopies", () => {
    it("keeps Ruby's existing shared field storage by default", () => {
        expect(render("internal/types/model.Template.rb", false)).not.toContain("def initialize_copy");
    });
    it("emits the copy implementation and runtime regressions only when enabled", () => {
        expect(render("internal/types/model.Template.rb", true)).toContain("@explicit_fields = @explicit_fields.dup");
        const tests = "test/unit/internal/types/test_model.Template.rb";
        expect(render(tests, false)).not.toContain("keeps field assignments and explicit nulls independent");
        expect(render(tests, true)).toContain("keeps field assignments and explicit nulls independent");
    });
});
