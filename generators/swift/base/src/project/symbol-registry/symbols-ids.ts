export const SWIFT_SYMBOL_NAME = "Swift";
export const FOUNDATION_SYMBOL_NAME = "Foundation";

export function swiftTypeSymbolId(symbolName: string) {
    return `${SWIFT_SYMBOL_NAME}.${symbolName}`;
}

export function foundationTypeSymbolId(symbolName: string) {
    return `${FOUNDATION_SYMBOL_NAME}.${symbolName}`;
}
