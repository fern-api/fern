import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface AuthProviderInstance {
    instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression;

    /**
     * Returns the properties to include in client instantiation snippets.
     * For example, for basic auth this returns username and password properties.
     */
    getSnippetProperties(context: SdkContext): ts.ObjectLiteralElementLike[];
}

export namespace AuthProviderInstance {
    export const FIELD_NAME = "_authProvider";
    export const OPTIONS_PROPERTY_NAME = "authProvider";

    export function getReferenceToField(): ts.Expression {
        // this._authProvider
        return ts.factory.createPropertyAccessExpression(ts.factory.createThis(), FIELD_NAME);
    }
}
