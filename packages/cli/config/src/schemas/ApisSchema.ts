import { z } from "zod";
import { ApiDefinitionSchema } from "./ApiDefinitionSchema";

/**
 * The apis section of fern.yml contains named API definitions.
 * Each key is the API name, and the value is the API definition.
 */
export const ApisSchema: z.ZodRecord<
    z.ZodString,
    z.ZodObject<
        {
            specs: z.ZodArray<
                z.ZodUnion<
                    readonly [
                        z.ZodObject<
                            {
                                openapi: z.ZodString;
                                origin: z.ZodOptional<z.ZodString>;
                                overrides: z.ZodOptional<z.ZodString>;
                                overlays: z.ZodOptional<z.ZodString>;
                                namespace: z.ZodOptional<z.ZodString>;
                                settings: z.ZodOptional<
                                    z.ZodObject<
                                        {
                                            respectNullableSchemas: z.ZodOptional<z.ZodBoolean>;
                                            wrapReferencesToNullableInOptional: z.ZodOptional<z.ZodBoolean>;
                                            coerceOptionalSchemasToNullable: z.ZodOptional<z.ZodBoolean>;
                                            titleAsSchemaName: z.ZodOptional<z.ZodBoolean>;
                                            coerceEnumsToLiterals: z.ZodOptional<z.ZodBoolean>;
                                            optionalAdditionalProperties: z.ZodOptional<z.ZodBoolean>;
                                            idiomaticRequestNames: z.ZodOptional<z.ZodBoolean>;
                                            groupEnvironmentsByHost: z.ZodOptional<z.ZodBoolean>;
                                            removeDiscriminantsFromSchemas: z.ZodOptional<
                                                z.ZodEnum<{ always: "always"; never: "never" }>
                                            >;
                                            pathParameterOrder: z.ZodOptional<
                                                z.ZodEnum<{ urlOrder: "urlOrder"; specOrder: "specOrder" }>
                                            >;
                                            onlyIncludeReferencedSchemas: z.ZodOptional<z.ZodBoolean>;
                                            inlinePathParameters: z.ZodOptional<z.ZodBoolean>;
                                            preferUndiscriminatedUnionsWithLiterals: z.ZodOptional<z.ZodBoolean>;
                                            objectQueryParameters: z.ZodOptional<z.ZodBoolean>;
                                            respectReadonlySchemas: z.ZodOptional<z.ZodBoolean>;
                                            respectForwardCompatibleEnums: z.ZodOptional<z.ZodBoolean>;
                                            useBytesForBinaryResponse: z.ZodOptional<z.ZodBoolean>;
                                            defaultFormParameterEncoding: z.ZodOptional<
                                                z.ZodEnum<{ form: "form"; json: "json" }>
                                            >;
                                            filter: z.ZodOptional<
                                                z.ZodObject<
                                                    { endpoints: z.ZodOptional<z.ZodArray<z.ZodString>> },
                                                    z.core.$strip
                                                >
                                            >;
                                            exampleGeneration: z.ZodOptional<
                                                z.ZodObject<
                                                    {
                                                        request: z.ZodOptional<
                                                            z.ZodObject<
                                                                { maxDepth: z.ZodOptional<z.ZodNumber> },
                                                                z.core.$strip
                                                            >
                                                        >;
                                                        response: z.ZodOptional<
                                                            z.ZodObject<
                                                                { maxDepth: z.ZodOptional<z.ZodNumber> },
                                                                z.core.$strip
                                                            >
                                                        >;
                                                    },
                                                    z.core.$strip
                                                >
                                            >;
                                            additionalPropertiesDefaultsTo: z.ZodOptional<z.ZodBoolean>;
                                            typeDatesAsStrings: z.ZodOptional<z.ZodBoolean>;
                                            preserveSingleSchemaOneof: z.ZodOptional<z.ZodBoolean>;
                                            inlineAllOfSchemas: z.ZodOptional<z.ZodBoolean>;
                                            resolveAliases: z.ZodOptional<
                                                z.ZodUnion<
                                                    readonly [
                                                        z.ZodBoolean,
                                                        z.ZodObject<
                                                            { except: z.ZodOptional<z.ZodArray<z.ZodString>> },
                                                            z.core.$strip
                                                        >
                                                    ]
                                                >
                                            >;
                                            groupMultiApiEnvironments: z.ZodOptional<z.ZodBoolean>;
                                            defaultIntegerFormat: z.ZodOptional<
                                                z.ZodEnum<{
                                                    int32: "int32";
                                                    int64: "int64";
                                                    uint32: "uint32";
                                                    uint64: "uint64";
                                                }>
                                            >;
                                        },
                                        z.core.$strip
                                    >
                                >;
                            },
                            z.core.$strip
                        >,
                        z.ZodObject<
                            {
                                asyncapi: z.ZodString;
                                origin: z.ZodOptional<z.ZodString>;
                                overrides: z.ZodOptional<z.ZodString>;
                                namespace: z.ZodOptional<z.ZodString>;
                                settings: z.ZodOptional<
                                    z.ZodObject<
                                        {
                                            respectNullableSchemas: z.ZodOptional<z.ZodBoolean>;
                                            wrapReferencesToNullableInOptional: z.ZodOptional<z.ZodBoolean>;
                                            coerceOptionalSchemasToNullable: z.ZodOptional<z.ZodBoolean>;
                                            titleAsSchemaName: z.ZodOptional<z.ZodBoolean>;
                                            coerceEnumsToLiterals: z.ZodOptional<z.ZodBoolean>;
                                            optionalAdditionalProperties: z.ZodOptional<z.ZodBoolean>;
                                            idiomaticRequestNames: z.ZodOptional<z.ZodBoolean>;
                                            groupEnvironmentsByHost: z.ZodOptional<z.ZodBoolean>;
                                            removeDiscriminantsFromSchemas: z.ZodOptional<
                                                z.ZodEnum<{ always: "always"; never: "never" }>
                                            >;
                                            pathParameterOrder: z.ZodOptional<
                                                z.ZodEnum<{ urlOrder: "urlOrder"; specOrder: "specOrder" }>
                                            >;
                                            messageNaming: z.ZodOptional<z.ZodEnum<{ v1: "v1"; v2: "v2" }>>;
                                        },
                                        z.core.$strip
                                    >
                                >;
                            },
                            z.core.$strip
                        >,
                        z.ZodObject<
                            {
                                proto: z.ZodObject<
                                    {
                                        root: z.ZodString;
                                        target: z.ZodOptional<z.ZodString>;
                                        overrides: z.ZodOptional<z.ZodString>;
                                        localGeneration: z.ZodOptional<z.ZodBoolean>;
                                        fromOpenapi: z.ZodOptional<z.ZodBoolean>;
                                        dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    },
                                    z.core.$strip
                                >;
                                settings: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
                            },
                            z.core.$strip
                        >,
                        z.ZodObject<
                            { fern: z.ZodString; settings: z.ZodOptional<z.ZodObject<{}, z.core.$strip>> },
                            z.core.$strip
                        >,
                        z.ZodObject<
                            { conjure: z.ZodString; settings: z.ZodOptional<z.ZodObject<{}, z.core.$strip>> },
                            z.core.$strip
                        >,
                        z.ZodObject<
                            {
                                openrpc: z.ZodString;
                                overrides: z.ZodOptional<z.ZodString>;
                                settings: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
                            },
                            z.core.$strip
                        >
                    ]
                >
            >;
            auth: z.ZodOptional<z.ZodString>;
            defaultUrl: z.ZodOptional<z.ZodString>;
            defaultEnvironment: z.ZodOptional<z.ZodString>;
            environments: z.ZodOptional<
                z.ZodRecord<
                    z.ZodString,
                    z.ZodUnion<
                        readonly [
                            z.ZodString,
                            z.ZodObject<{ url: z.ZodString; docs: z.ZodOptional<z.ZodString> }, z.core.$strip>,
                            z.ZodObject<
                                { urls: z.ZodRecord<z.ZodString, z.ZodString>; docs: z.ZodOptional<z.ZodString> },
                                z.core.$strip
                            >
                        ]
                    >
                >
            >;
            headers: z.ZodOptional<
                z.ZodRecord<
                    z.ZodString,
                    z.ZodUnion<
                        readonly [
                            z.ZodString,
                            z.ZodObject<
                                {
                                    name: z.ZodOptional<z.ZodString>;
                                    env: z.ZodOptional<z.ZodString>;
                                    docs: z.ZodOptional<z.ZodString>;
                                },
                                z.core.$strip
                            >
                        ]
                    >
                >
            >;
            authSchemes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        },
        z.core.$strip
    >
> = z.record(z.string(), ApiDefinitionSchema);

export type ApisSchema = z.infer<typeof ApisSchema>;
