import { OpenAPIV3_1 } from "openapi-types";

import { AuthScheme } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v3-importer-commons";

import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export declare namespace SecuritySchemeConverter {
    export interface Args extends AbstractConverter.Args<OpenAPIConverterContext3_1> {
        securityScheme: OpenAPIV3_1.SecuritySchemeObject;
    }
}

export class SecuritySchemeConverter extends AbstractConverter<OpenAPIConverterContext3_1, AuthScheme> {
    private readonly securityScheme: OpenAPIV3_1.SecuritySchemeObject;

    constructor({ context, breadcrumbs, securityScheme }: SecuritySchemeConverter.Args) {
        super({ context, breadcrumbs });
        this.securityScheme = securityScheme;
    }

    public convert(): AuthScheme | undefined {
        switch (this.securityScheme.type) {
            case "http": {
                if (this.securityScheme.scheme === "bearer") {
                    return AuthScheme.bearer({
                        token: this.context.casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: this.securityScheme.description
                    });
                }
                if (this.securityScheme.scheme === "basic") {
                    return AuthScheme.basic({
                        username: this.context.casingsGenerator.generateName("username"),
                        password: this.context.casingsGenerator.generateName("password"),
                        usernameEnvVar: undefined,
                        passwordEnvVar: undefined,
                        docs: this.securityScheme.description
                    });
                }
                break;
            }
            case "apiKey": {
                if (this.securityScheme.in === "header") {
                    return AuthScheme.header({
                        name: {
                            name: this.context.casingsGenerator.generateName("apiKey"),
                            wireValue: this.securityScheme.name
                        },
                        valueType: AbstractConverter.OPTIONAL_STRING,
                        prefix: undefined,
                        headerEnvVar: undefined,
                        docs: this.securityScheme.description
                    });
                }
                break;
            }
            case "oauth2": {
                // TODO: Correctly implement OAuth.
                return AuthScheme.bearer({
                    token: this.context.casingsGenerator.generateName("token"),
                    tokenEnvVar: undefined,
                    docs: this.securityScheme.description
                });
            }
        }
        return undefined;
    }
}
