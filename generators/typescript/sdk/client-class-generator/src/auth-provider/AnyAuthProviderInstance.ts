import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class AnyAuthProviderInstance implements AuthProviderInstance {
    private readonly providers: AuthProviderInstance[];

    constructor(providers: AuthProviderInstance[]) {
        this.providers = providers;
    }

    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/AnyAuthProvider", {
            namedImports: ["AnyAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("AnyAuthProvider"), undefined, params);
    }

    public getSnippetProperties(context: SdkContext): ts.ObjectLiteralElementLike[] {
        // For ANY auth, combine snippet properties from all constituent auth providers
        const allProperties: ts.ObjectLiteralElementLike[] = [];
        for (const provider of this.providers) {
            allProperties.push(...provider.getSnippetProperties(context));
        }
        return allProperties;
    }
}
