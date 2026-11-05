import { getOriginalName } from "@fern-api/base-generator";
import { resolve } from "path";
import { expect, it } from "vitest";
import { createSampleGeneratorContext } from "../test-utils/createSampleGeneratorContext.js";

it("retains referenced primitive defaults without applying element defaults to collections", async () => {
    const context = await createSampleGeneratorContext(resolve(__dirname, "test-definitions/referenced-defaults"));
    const model = Object.values(context.ir.types).find((type) => getOriginalName(type.name.name) === "Values");
    if (model?.shape.type !== "object") throw new Error("Missing Values model");
    const defaults = Object.fromEntries(model.shape.properties.map((property) => [getOriginalName(property.name), property.defaultValue]));
    expect(defaults).toEqual({ disabled: false, enabled: true, zero: 0, empty: "", alias: false, optional: false, list: undefined, map: undefined });
});
