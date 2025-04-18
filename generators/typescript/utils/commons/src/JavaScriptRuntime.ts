import { Values, assertNever } from "@fern-api/core-utils";

export const JavaScriptRuntime = {
    NODE: "node",
    BROWSER: "browser"
} as const;

export type JavaScriptRuntime = Values<typeof JavaScriptRuntime>;

export function visitJavaScriptRuntime<R>(runtime: JavaScriptRuntime, visitor: JavaScriptRuntimeVisitor<R>): R {
    switch (runtime) {
        case JavaScriptRuntime.BROWSER:
            return visitor.browser();
        case JavaScriptRuntime.NODE:
            return visitor.node();
        default:
            assertNever(runtime);
    }
}

export interface JavaScriptRuntimeVisitor<R> {
    node: () => R;
    browser: () => R;
}
