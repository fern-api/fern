import { Eta } from "eta";
import { readFileSync } from "fs";
import { join } from "path";
import { expect, it } from "vitest";

const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });
it("gates method protection and its regressions without changing default accessors", () => {
    for (const protectModelMethods of [false, true]) {
        const render = (path: string): string => eta.renderString(readFileSync(join(__dirname, "../asIs", path), "utf8"), {
            gem_namespace: "Seed", omitUnsetModelFields: false, protectModelMethods
        });
        expect(render("internal/types/model.Template.rb").includes("private_method_defined?(setter)")).toBe(protectModelMethods);
        expect(render("test/unit/internal/types/test_model.Template.rb").includes("keeps an extra-field reader when only its setter collides")).toBe(protectModelMethods);
    }
});
