import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath } from "@fern-typescript/commons";
import { FileContext, GeneratedFile } from "@fern-typescript/contexts";

import {
    AnyAuthProviderGenerator,
    AuthProviderGenerator,
    BasicAuthProviderGenerator,
    BearerAuthProviderGenerator,
    HeaderAuthProviderGenerator,
    InferredAuthProviderGenerator,
    OAuthAuthProviderGenerator,
    RoutingAuthProviderGenerator
} from "./auth-provider/index.js";

export declare namespace AuthProvidersGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.AuthScheme | { type: "any" } | { type: "routing" };
        neverThrowErrors: boolean;
        includeSerdeLayer: boolean;
        shouldUseWrapper: boolean;
        // When true, treat auth as optional even when the spec mandates it,
        // so the client can be constructed without providing credentials.
        optionalAuth?: boolean;
    }
}

export class AuthProvidersGenerator implements GeneratedFile<FileContext> {
    private readonly authProviderGenerator: AuthProviderGenerator | undefined;
    constructor({
        ir,
        authScheme,
        neverThrowErrors,
        includeSerdeLayer,
        shouldUseWrapper,
        optionalAuth = false
    }: AuthProvidersGenerator.Init) {
        const isAuthMandatory = ir.sdkConfig.isAuthMandatory && !optionalAuth;
        this.authProviderGenerator = (() => {
            switch (authScheme.type) {
                case "any":
                    return new AnyAuthProviderGenerator({
                        ir
                    });
                case "routing":
                    return new RoutingAuthProviderGenerator({
                        ir
                    });
                case "inferred":
                    return new InferredAuthProviderGenerator({
                        ir,
                        authScheme,
                        neverThrowErrors,
                        shouldUseWrapper
                    });
                case "basic":
                    return new BasicAuthProviderGenerator({
                        ir,
                        authScheme,
                        neverThrowErrors,
                        isAuthMandatory,
                        shouldUseWrapper
                    });
                case "bearer":
                    return new BearerAuthProviderGenerator({
                        ir,
                        authScheme,
                        neverThrowErrors,
                        isAuthMandatory,
                        shouldUseWrapper
                    });
                case "header":
                    return new HeaderAuthProviderGenerator({
                        ir,
                        authScheme,
                        neverThrowErrors,
                        isAuthMandatory,
                        shouldUseWrapper
                    });
                case "oauth":
                    return new OAuthAuthProviderGenerator({
                        ir,
                        authScheme,
                        neverThrowErrors,
                        includeSerdeLayer,
                        shouldUseWrapper
                    });
                default:
                    assertNever(authScheme);
            }
        })();
    }

    public shouldWriteFile(): boolean {
        return this.authProviderGenerator !== undefined;
    }

    public writeToFile(context: FileContext) {
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
