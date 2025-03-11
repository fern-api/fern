import { OpenAPIV3_1 } from "openapi-types";

import { AuthScheme, ContainerType, PrimitiveTypeV2, TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";

export declare namespace SecuritySchemeConverter {
    export interface Args extends AbstractConverter.Args {
        securityScheme: OpenAPIV3_1.SecuritySchemeObject;
    }
}

export class SecuritySchemeConverter extends AbstractConverter<OpenAPIConverterContext3_1, AuthScheme> {
    private readonly securityScheme: OpenAPIV3_1.SecuritySchemeObject;

    constructor({ breadcrumbs, securityScheme }: SecuritySchemeConverter.Args) {
        super({ breadcrumbs });
        this.securityScheme = securityScheme;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): AuthScheme | undefined {
        switch (this.securityScheme.type) {
            case "http": {
                if (this.securityScheme.scheme === "bearer") {
                    return AuthScheme.bearer({
                        token: context.casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: this.securityScheme.description
                    });
                }
                if (this.securityScheme.scheme === "basic") {
                    return AuthScheme.basic({
                        username: context.casingsGenerator.generateName("username"),
                        password: context.casingsGenerator.generateName("password"),
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
                            name: context.casingsGenerator.generateName(this.securityScheme.name),
                            wireValue: this.securityScheme.name
                        },
                        valueType: TypeReference.container(
                            ContainerType.optional(
                                TypeReference.primitive({
                                    v1: "STRING",
                                    v2: PrimitiveTypeV2.string({ default: undefined, validation: undefined })
                                })
                            )
                        ),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        docs: this.securityScheme.description
                    });
                }
                break;
            }
            case "oauth2": {
                // Treat OAuth as bearer auth for now
                return AuthScheme.bearer({
                    token: context.casingsGenerator.generateName("token"),
                    tokenEnvVar: undefined,
                    docs: this.securityScheme.description
                });
            }
        }
        return undefined;
    }
}
