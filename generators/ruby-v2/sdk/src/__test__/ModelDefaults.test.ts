import { generateFields, ObjectGenerator } from "@fern-api/ruby-model";
import { resolve } from "path";
import { beforeAll, describe, expect, it } from "vitest";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { createSampleGeneratorContext } from "../test-utils/createSampleGeneratorContext.js";

describe("opt-in schema defaults", () => {
    let enabled: SdkGeneratorContext;
    let disabled: SdkGeneratorContext;

    beforeAll(async () => {
        const fixture = resolve(__dirname, "../endpoint/utils/__test__/test-definitions/response-bodies");
        enabled = await createSampleGeneratorContext(fixture, { useSchemaDefaults: true });
        disabled = await createSampleGeneratorContext(fixture);
    });

    function render(context: SdkGeneratorContext, defaultValue: unknown): string {
        for (const type of Object.values(context.ir.types)) {
            if (type.shape.type !== "object" || type.shape.properties[0] == null) {
                continue;
            }
            return generateFields({
                context,
                applyDefaults: context.customConfig.useSchemaDefaults,
                properties: [{ ...type.shape.properties[0], defaultValue }]
            })
                .map((node) => node.toString({ customConfig: context.customConfig }))
                .join("\n");
        }
        throw new Error("Expected a fixture model property");
    }

    it.each(
        [false, 0, 100, "USD", ["one"], { enabled: false }].map((value) => ({ value }))
    )("emits a fresh default for $value", ({ value }) => {
        expect(render(enabled, value)).toContain("default_factory: -> { ::JSON.parse(");
    });

    it("keeps existing output when the option is off or there is no default", () => {
        expect(render(disabled, 100)).not.toContain("default_factory:");
        expect(render(enabled, undefined)).not.toContain("default_factory:");
        expect(render(enabled, null)).not.toContain("default_factory:");
    });

    it("escapes Ruby interpolation in string defaults", () => {
        const rendered = render(enabled, '#{raise "unexpected"} #$global #@instance');
        expect(rendered).toContain("\\#{");
        expect(rendered).toContain("\\#$");
        expect(rendered).toContain("\\#@");
    });
});

it("wires defaults into model generation only when enabled", async () => {
    const fixture = resolve(__dirname, "../endpoint/utils/__test__/test-definitions/response-bodies");
    const context = await createSampleGeneratorContext(fixture);
    const model = Object.values(context.ir.types).find((type) => type.shape.type === "object" && type.shape.properties.length > 0);
    if (model?.shape.type !== "object" || model.shape.properties[0] == null) throw new Error("Missing fixture model");
    model.shape.properties[0].defaultValue = false;
    const shape = model.shape;
    const render = () => String(new ObjectGenerator(context, model, shape).generate().fileContents);
    expect(render()).not.toContain("default_factory:");
    context.customConfig.useSchemaDefaults = true;
    expect(render()).toContain("default_factory:");
});
