import { FoundationTypeSymbolName, SwiftTypeSymbolName } from "../ast";

const SWIFT_SYMBOL_NAME = "Swift";
const SWIFT_SYMBOL_ID = SWIFT_SYMBOL_NAME;

const FOUNDATION_SYMBOL_NAME = "Foundation";
const FOUNDATION_SYMBOL_ID = FOUNDATION_SYMBOL_NAME;

export const Symbol = {
    swiftSymbolId: SWIFT_SYMBOL_NAME,
    swiftSymbolName: SWIFT_SYMBOL_NAME,
    swiftTypeSymbolId: (symbolName: SwiftTypeSymbolName) => `${SWIFT_SYMBOL_ID}.${symbolName}`,
    isSwiftTypeSymbolId: (symbolId: string) => symbolId.startsWith(`${SWIFT_SYMBOL_ID}.`),

    foundationSymbolId: FOUNDATION_SYMBOL_NAME,
    foundationSymbolName: FOUNDATION_SYMBOL_NAME,
    foundationTypeSymbolId: (symbolName: FoundationTypeSymbolName) => `${FOUNDATION_SYMBOL_ID}.${symbolName}`,
    isFoundationTypeSymbolId: (symbolId: string) => symbolId.startsWith(`${FOUNDATION_SYMBOL_ID}.`),

    isCustomTypeSymbolId: (symbolId: string) =>
        !symbolId.startsWith(`${SWIFT_SYMBOL_ID}.`) && !symbolId.startsWith(`${FOUNDATION_SYMBOL_ID}.`)
};

export { TargetSymbolRegistry } from "./target-symbol-registry";
