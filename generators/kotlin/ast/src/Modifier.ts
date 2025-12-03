export type Modifier =
    | "public"
    | "private"
    | "protected"
    | "internal"
    | "abstract"
    | "open"
    | "final"
    | "override"
    | "suspend"
    | "inline"
    | "infix"
    | "operator"
    | "data"
    | "sealed"
    | "inner"
    | "companion"
    | "const"
    | "lateinit"
    | "vararg"
    | "noinline"
    | "crossinline"
    | "reified";

export function writeModifiers(modifiers: Modifier[]): string {
    return modifiers.length > 0 ? modifiers.join(" ") + " " : "";
}
