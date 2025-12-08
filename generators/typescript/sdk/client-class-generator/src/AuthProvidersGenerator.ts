import { assertNever } from "@fern-api/core-utils";
import { AuthScheme, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ExportedFilePath } from "@fern-typescript/commons";
import { GeneratedFile, SdkContext } from "@fern-typescript/contexts";

import {
    AnyAuthProviderGenerator,
    AnyAuthV2ProviderGenerator,
    AuthProviderGenerator,
    BasicAuthProviderGenerator,
    BearerAuthProviderGenerator,
    HeaderAuthProviderGenerator,
    InferredAuthProviderGenerator,
    OAuthAuthProviderGenerator
} from "./auth-provider";

export declare namespace AuthProvidersGenerator {
    export interface Init {
        ir: IntermediateRepresentation;
        authScheme: AuthScheme | { type: "any" } | { type: "anyAuthV2" };
        neverThrowErrors: boolean;
        includeSerdeLayer: boolean;
        oauthTokenOverride: boolean;
    }
}

export class AuthProvidersGenerator implements GeneratedFile<SdkContext> {
    private readonly authProviderGenerator: AuthProviderGenerator | undefined;
    constructor({
        ir,
        authScheme,
        neverThrowErrors,
        includeSerdeLayer,
        oauthTokenOverride
    }: AuthProvidersGenerator.Init) {
        this.authProviderGenerator = (() => {
            switch (authScheme.type) {
                case "any":
                    return new AnyAuthProviderGenerator({
                        ir
                    });
                case "anyAuthV2":
                    return new AnyAuthV2ProviderGenerator({
                        ir,
                        neverThrowErrors,
                        includeSerdeLayer,
                        oauthTokenOverride
                    });
                case "inferred":
                    return new InferredAuthProviderGenerator({
                        ir,
                        authScheme
                    });
                case "basic":
                    return new BasicAuthProviderGenerator({
                        authScheme
                    });
                case "bearer":
                    return new BearerAuthProviderGenerator({
                        authScheme,
                        neverThrowErrors,
                        isAuthMandatory: ir.sdkConfig.isAuthMandatory
                    });
                case "header":
                    return new HeaderAuthProviderGenerator({
                        authScheme,
                        neverThrowErrors,
                        isAuthMandatory: ir.sdkConfig.isAuthMandatory
                    });
                case "oauth":
                    return new OAuthAuthProviderGenerator({
                        ir,
                        authScheme,
                        neverThrowErrors,
                        includeSerdeLayer,
                        oauthTokenOverride
                    });
                default:
                    assertNever(authScheme);
            }
        })();
    }

    public shouldWriteFile(): boolean {
        return this.authProviderGenerator !== undefined;
    }

    public writeToFile(context: SdkContext) {
        if (!this.shouldWriteFile()) {
            return;
        }
        if (!this.authProviderGenerator) {
            throw new Error("Auth provider generator is not defined.");
        }
        this.authProviderGenerator.writeToFile(context);
    }

    public getFilePath(): ExportedFilePath {
        if (!this.authProviderGenerator) {
            throw new Error("Auth provider generator is not defined.");
        }
        return this.authProviderGenerator.getFilePath();
    }
}
