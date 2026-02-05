import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class RoutingAuthProviderInstance implements AuthProviderInstance {
    private readonly providers: Map<string, AuthProviderInstance>;

    constructor(providers: Map<string, AuthProviderInstance>) {
        this.providers = providers;
    }

    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/RoutingAuthProvider", {
            namedImports: ["RoutingAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("RoutingAuthProvider"), undefined, params);
    }

    public getSnippetProperties(context: SdkContext): ts.ObjectLiteralElementLike[] {
        const allProperties: ts.ObjectLiteralElementLike[] = [];
        for (const provider of this.providers.values()) {
            allProperties.push(...provider.getSnippetProperties(context));
        }
        return allProperties;
    }
}
