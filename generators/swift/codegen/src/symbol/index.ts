import { FoundationTypeSymbolName, SwiftTypeSymbolName } from "../ast";

const SWIFT_SYMBOL_NAME = "Swift";
const SWIFT_SYMBOL_ID = SWIFT_SYMBOL_NAME;

const FOUNDATION_SYMBOL_NAME = "Foundation";
const FOUNDATION_SYMBOL_ID = FOUNDATION_SYMBOL_NAME;

export const Symbol = {
    swiftSymbolId: SWIFT_SYMBOL_NAME,
    swiftSymbolName: SWIFT_SYMBOL_NAME,
    swiftTypeSymbolId: (symbolName: SwiftTypeSymbolName) => `${SWIFT_SYMBOL_ID}.${symbolName}`,

    foundationSymbolId: FOUNDATION_SYMBOL_NAME,
    foundationSymbolName: FOUNDATION_SYMBOL_NAME,
    foundationTypeSymbolId: (symbolName: FoundationTypeSymbolName) => `${FOUNDATION_SYMBOL_ID}.${symbolName}`
};

export { TargetSymbolRegistry } from "./target-symbol-registry";
