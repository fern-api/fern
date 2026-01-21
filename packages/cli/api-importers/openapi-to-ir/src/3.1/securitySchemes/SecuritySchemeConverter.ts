import { AuthScheme } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";

import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export declare namespace SecuritySchemeConverter {
    export interface Args extends AbstractConverter.Args<OpenAPIConverterContext3_1> {
        securityScheme: OpenAPIV3_1.SecuritySchemeObject;
        schemeId: string;
    }
}

export class SecuritySchemeConverter extends AbstractConverter<OpenAPIConverterContext3_1, AuthScheme> {
    private readonly securityScheme: OpenAPIV3_1.SecuritySchemeObject;
    private readonly schemeId: string;

    constructor({ context, breadcrumbs, securityScheme, schemeId }: SecuritySchemeConverter.Args) {
        super({ context, breadcrumbs });
        this.securityScheme = securityScheme;
        this.schemeId = schemeId;
    }

    public convert(): AuthScheme | undefined {
        switch (this.securityScheme.type) {
            case "http": {
                // Case insensitivity for securityScheme.scheme required per OAS spec
                if (this.securityScheme.scheme?.toLowerCase() === "bearer") {
                    return AuthScheme.bearer({
                        key: this.schemeId,
                        token: this.context.casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: this.securityScheme.description
                    });
                }
                if (this.securityScheme.scheme?.toLowerCase() === "basic") {
                    return AuthScheme.basic({
                        key: this.schemeId,
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
                        key: this.schemeId,
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
                    key: this.schemeId,
                    token: this.context.casingsGenerator.generateName("token"),
                    tokenEnvVar: undefined,
                    docs: this.securityScheme.description
                });
            }
        }
        return undefined;
    }
}
