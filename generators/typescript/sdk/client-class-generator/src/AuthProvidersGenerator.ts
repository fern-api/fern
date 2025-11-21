import { assertNever } from "@fern-api/core-utils";
import { AuthScheme, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ExportedFilePath } from "@fern-typescript/commons";
import { GeneratedFile, SdkContext } from "@fern-typescript/contexts";

import {
    AuthProviderGenerator,
    BasicAuthProviderGenerator,
    BearerAuthProviderGenerator,
    HeaderAuthProviderGenerator,
    InferredAuthProviderGenerator
} from "./auth-provider";

export declare namespace AuthProvidersGenerator {
    export interface Init {
        ir: IntermediateRepresentation;
        authScheme: AuthScheme;
        neverThrowErrors: boolean;
    }
}

export class AuthProvidersGenerator implements GeneratedFile<SdkContext> {
    private readonly authProviderGenerator: AuthProviderGenerator | undefined;
    constructor({ ir, authScheme, neverThrowErrors }: AuthProvidersGenerator.Init) {
        this.authProviderGenerator = (() => {
            switch (authScheme.type) {
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
                    return undefined;
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
