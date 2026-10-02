import type { FernIr } from "@fern-fern/ir-sdk";

export function getHeaderAuthProviderClassName(
    ir: FernIr.IntermediateRepresentation,
    authScheme: FernIr.HeaderAuthScheme
): string {
    const index = ir.auth.schemes
        .filter((scheme) => scheme.type === "header")
        .findIndex((scheme) => scheme.key === authScheme.key);
    return index > 0 ? `HeaderAuthProvider${index + 1}` : "HeaderAuthProvider";
}
