import { V2SchemaExamples } from "@fern-api/ir-sdk";
import { camelCase } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter, AbstractConverterContext } from "../..";
import { ExampleConverter } from "../ExampleConverter";
import { SchemaOrReferenceConverter } from "../schema";
import { SchemaConverter } from "../schema/SchemaConverter";

export declare namespace AbstractMediaTypeObjectConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        group: string[];
        method: string;
    }

    export interface MediaTypeObject extends SchemaOrReferenceConverter.Output {
        examples?: Record<string, OpenAPIV3_1.ExampleObject>;
    }

    export interface Output {
        examples?: Record<string, OpenAPIV3_1.ExampleObject>;
        inlinedTypes: Record<string, SchemaConverter.ConvertedSchema>;
    }
}

export abstract class AbstractMediaTypeObjectConverter extends AbstractConverter<
    AbstractConverterContext<object>,
    AbstractMediaTypeObjectConverter.Output
> {
    protected readonly group: string[];
    protected readonly method: string;

    constructor({ context, breadcrumbs, group, method }: AbstractMediaTypeObjectConverter.Args) {
        super({ context, breadcrumbs });
        this.group = group;
        this.method = method;
    }

    abstract convert(): AbstractMediaTypeObjectConverter.Output | undefined;

    protected parseMediaTypeObject({
        mediaTypeObject,
        resolveSchema,
        contentType,
        schemaId
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
        contentType: string;
        resolveSchema?: boolean;
        schemaId: string;
    }): AbstractMediaTypeObjectConverter.MediaTypeObject | undefined {
        if (mediaTypeObject.schema == null) {
            return undefined;
        }
        if (resolveSchema) {
            const resolvedSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                schemaOrReference: mediaTypeObject.schema,
                breadcrumbs: [...this.breadcrumbs, "content", contentType]
            });
            if (resolvedSchema == null) {
                return undefined;
            }
            mediaTypeObject.schema = resolvedSchema;
        }

        const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
            context: this.context,
            breadcrumbs: [...this.breadcrumbs, "content", contentType, "schema"],
            schemaOrReference: mediaTypeObject.schema,
            schemaIdOverride: schemaId
        });

        const convertedSchema = schemaOrReferenceConverter.convert();
        if (convertedSchema == null) {
            return undefined;
        }

        const examples =
            mediaTypeObject.examples != null
                ? Object.fromEntries(
                      Object.entries(mediaTypeObject.examples)
                          .map(([key, example]) => {
                              if (this.context.isReferenceObject(example)) {
                                  const resolved = this.context.resolveReference<OpenAPIV3_1.ExampleObject>({
                                      reference: example,
                                      breadcrumbs: [...this.breadcrumbs, "content", contentType, "examples"],
                                      skipErrorCollector: true
                                  });
                                  return resolved.resolved ? [key, resolved.value] : null;
                              }
                              return [key, example];
                          })
                          .filter((entry): entry is [string, OpenAPIV3_1.ExampleObject] => entry != null)
                  )
                : undefined;

        return { ...convertedSchema, examples };
    }

    protected parseMediaTypeSchemaOrReference({
        schemaOrReference,
        schemaId
    }: {
        schemaOrReference: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        schemaId: string;
    }): AbstractMediaTypeObjectConverter.MediaTypeObject | undefined {
        const schemaOrReferenceConverter = new SchemaOrReferenceConverter({
            context: this.context,
            breadcrumbs: [...this.breadcrumbs],
            schemaOrReference,
            schemaIdOverride: schemaId
        });
        const convertedSchema = schemaOrReferenceConverter.convert();
        if (convertedSchema == null) {
            return undefined;
        }
        return { ...convertedSchema, examples: undefined };
    }

    protected convertMediaTypeObjectExamples({
        mediaTypeObject,
        generateOptionalProperties,
        exampleGenerationStrategy
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject | undefined;
        generateOptionalProperties?: boolean;
        exampleGenerationStrategy?: "request" | "response";
    }): V2SchemaExamples {
        const v2Examples: V2SchemaExamples = {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        };
        const schema = mediaTypeObject?.schema;
        const examples = this.context.getNamedExamplesFromMediaTypeObject({
            mediaTypeObject,
            breadcrumbs: this.breadcrumbs,
            defaultExampleName: `${[...this.group, this.method].join("_")}_example`
        });

        for (const [key, example] of examples) {
            const resolvedExample = this.context.resolveExampleWithValue(example);
            const exampleName = this.context.isExampleWithSummary(example) ? example.summary : key;
            if (resolvedExample != null) {
                if (schema != null) {
                    v2Examples.userSpecifiedExamples[exampleName] = this.generateOrValidateExample({
                        schema,
                        example: resolvedExample,
                        exampleGenerationStrategy
                    });
                } else {
                    v2Examples.userSpecifiedExamples[exampleName] = resolvedExample;
                }
            }
        }

        if (Object.keys(v2Examples.userSpecifiedExamples).length === 0 && schema != null) {
            const exampleName = camelCase(`${[...this.group, this.method].join("_")}_example`);
            v2Examples.autogeneratedExamples[exampleName] = this.generateOrValidateExample({
                schema,
                example: undefined,
                ignoreErrors: true,
                generateOptionalProperties,
                exampleGenerationStrategy
            });
        }

        return v2Examples;
    }

    protected generateOrValidateExample({
        schema,
        example,
        ignoreErrors,
        generateOptionalProperties,
        exampleGenerationStrategy
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
        ignoreErrors?: boolean;
        example: unknown;
        generateOptionalProperties?: boolean;
        exampleGenerationStrategy?: "request" | "response";
        skipErrorCollector?: boolean;
    }): unknown {
        const resolvedSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
            schemaOrReference: schema,
            breadcrumbs: this.breadcrumbs,
            skipErrorCollector: true
        });
        if (resolvedSchema == null) {
            return undefined;
        }
        const schemaExamples = this.context.getExamplesFromSchema({
            schema: resolvedSchema,
            breadcrumbs: this.breadcrumbs
        });
        // We prioritize MediaTypeObject examples over Schema examples, but will fall back to
        // Schema examples if MediaTypeObject examples are not present.
        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema: resolvedSchema,
            example: example ?? schemaExamples[0],
            generateOptionalProperties: generateOptionalProperties ?? false,
            exampleGenerationStrategy
        });
        const { validExample: convertedExample, errors } = exampleConverter.convert();
        if (!ignoreErrors) {
            errors.forEach((error) => {
                this.context.errorCollector.collect({
                    message: error.message,
                    path: error.path
                });
            });
        }
        return convertedExample;
    }
}
