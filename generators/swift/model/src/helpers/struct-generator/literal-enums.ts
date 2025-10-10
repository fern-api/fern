import { swift } from "@fern-api/swift-codegen";
import { LiteralEnumGenerator } from "../../literal";
import { StructGenerator } from "./StructGenerator";

export function generateStringLiteralEnums(generatorArgs: StructGenerator.Args): swift.EnumWithRawValues[] {
    const { symbol, context } = generatorArgs;
    const registeredEnums = context.project.srcNameRegistry.getAllNestedLiteralEnumSymbolsOrThrow(symbol);
    return registeredEnums.map(({ symbol, literalValue }) => {
        const literalEnumGenerator = new LiteralEnumGenerator({
            name: symbol.name,
            literalValue
        });
        return literalEnumGenerator.generate();
    });
}
