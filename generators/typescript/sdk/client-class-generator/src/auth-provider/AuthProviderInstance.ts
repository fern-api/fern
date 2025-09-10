import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export abstract class AuthProviderInstance {
    public static readonly FIELD_NAME = "_authProvider";
    public static readonly OPTIONS_PROPERTY_NAME = "authProvider";

    public static getReferenceToField(): ts.Expression {
        // this._authProvider
        return ts.factory.createPropertyAccessExpression(ts.factory.createThis(), AuthProviderInstance.FIELD_NAME);
    }

    abstract instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression;
}
