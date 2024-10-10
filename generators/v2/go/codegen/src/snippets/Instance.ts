import { Name, Type } from "./generated/api";

/**
 * An instance that can be rendered into a language-specific AST node.
 *
 * The 'type' and 'value' are used to render the AST node itself, and the name
 * is (optionally) used within the dynamic snippet, e.g. for named fields.
 */
export interface Instance {
    name: Name;
    type: Type;
    value: unknown;
}
