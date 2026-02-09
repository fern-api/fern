import { swift } from "@fern-api/swift-codegen";
import { LiteralEnumGenerator } from "../../literal/index.js";
import { StructGenerator } from "./StructGenerator.js";

export function generateStringLiteralEnums(generatorArgs: StructGenerator.Args): swift.EnumWithRawValues[] {
    const { symbol, context } = generatorArgs;
    const registeredEnums = context.project.nameRegistry.getAllNestedLiteralEnumSymbolsOrThrow(symbol);
    return registeredEnums.map(({ symbol, literalValue }) => {
        const literalEnumGenerator = new LiteralEnumGenerator({
            name: symbol.name,
            literalValue
        });
        return literalEnumGenerator.generate();
    });
}
