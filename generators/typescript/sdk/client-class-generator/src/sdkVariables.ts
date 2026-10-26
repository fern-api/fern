import type { FernIr } from "@fern-fern/ir-sdk";
import type { TypeContext } from "@fern-typescript/contexts";

/**
 * An SDK variable gets an environment variable fallback only when it declares `envVar` and
 * resolves to a string, because environment variables are always strings.
 */
export function hasEnvVarFallback(
    variable: FernIr.VariableDeclaration,
    typeContext: Pick<TypeContext, "resolveTypeReference">
): boolean {
    if (variable.envVar == null) {
        return false;
    }
    const resolved = typeContext.resolveTypeReference(variable.type);
    return resolved.type === "primitive" && resolved.primitive.v1 === "STRING";
}
