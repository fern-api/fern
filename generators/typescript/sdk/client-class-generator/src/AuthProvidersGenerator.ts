import { assertNever } from "@fern-api/core-utils";
import { AuthScheme, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ExportedFilePath } from "@fern-typescript/commons";
import { GeneratedFile, SdkContext } from "@fern-typescript/contexts";

import { AuthProviderGenerator, BasicAuthProviderGenerator, InferredAuthProviderGenerator } from "./auth-provider";

export declare namespace AuthProvidersGenerator {
    export interface Init {
        ir: IntermediateRepresentation;
        authScheme: AuthScheme;
    }
}

export class AuthProvidersGenerator implements GeneratedFile<SdkContext> {
    private readonly authProviderGenerator: AuthProviderGenerator | undefined;
    constructor({ ir, authScheme }: AuthProvidersGenerator.Init) {
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
                case "header":
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
