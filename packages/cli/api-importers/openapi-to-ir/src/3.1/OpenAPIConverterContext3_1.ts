import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

import { FernIr, TypeReference } from '@fern-api/ir-sdk'
import { AbstractConverterContext, Converters, DisplayNameOverrideSource } from '@fern-api/v2-importer-commons'

import { DisplayNameExtension } from '../extensions/x-display-name'

/**
 * Context class for converting OpenAPI 3.1 specifications
 */
export class OpenAPIConverterContext3_1 extends AbstractConverterContext<OpenAPIV3_1.Document> {
    public globalHeaderNames: string[] | undefined
    private readonly tagToDisplayName: Record<string, string> = {}

    public isReferenceObject(
        parameter:
            | OpenAPIV3_1.ReferenceObject
            | OpenAPIV3_1.ParameterObject
            | OpenAPIV3_1.SchemaObject
            | OpenAPIV3_1.RequestBodyObject
            | OpenAPIV3_1.SecuritySchemeObject
            | OpenAPIV3.ReferenceObject
            | OpenAPIV3.ParameterObject
            | OpenAPIV3.SchemaObject
            | OpenAPIV3.RequestBodyObject
            | OpenAPIV3.SecuritySchemeObject
    ): parameter is OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject {
        return parameter != null && typeof parameter === 'object' && '$ref' in parameter
    }

    public convertReferenceToTypeReference({
        reference,
        breadcrumbs,
        displayNameOverride,
        displayNameOverrideSource
    }: {
        reference: OpenAPIV3_1.ReferenceObject
        breadcrumbs?: string[]
        displayNameOverride?: string | undefined
        displayNameOverrideSource?: DisplayNameOverrideSource
    }):
        | {
              ok: true
              reference: TypeReference
              inlinedTypes?: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>
          }
        | { ok: false } {
        const typeId = this.getTypeIdFromSchemaReference(reference)
        if (typeId == null) {
            return { ok: false }
        }
        const resolvedReference = this.resolveReference<OpenAPIV3_1.SchemaObject>({ reference, breadcrumbs })
        if (!resolvedReference.resolved) {
            return { ok: false }
        }

        let displayName: string | undefined

        if (displayNameOverrideSource === 'reference_identifier') {
            displayName = displayNameOverride ?? resolvedReference.value.title
        } else if (
            displayNameOverrideSource === 'discriminator_key' ||
            displayNameOverrideSource === 'schema_identifier'
        ) {
            displayName = resolvedReference.value.title ?? displayNameOverride
        }

        let inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> | undefined

        // If the typeId has a "/" then we can assume that it is actually a reference to
        // an inlined schema ($ref: /components/schemas/MySchema/properties/foo).
        // In this case we want to create an inlined type for the schema of the property foo.
        if (typeId.includes('/')) {
            const schemaConverter = new Converters.SchemaConverters.SchemaConverter({
                context: this,
                breadcrumbs: breadcrumbs ?? [],
                schema: resolvedReference.value,
                id: typeId
            })
            const convertedSchema = schemaConverter.convert()
            if (convertedSchema != null) {
                inlinedTypes = { [typeId]: convertedSchema.convertedSchema }
            }
        }

        return {
            ok: true,
            reference: TypeReference.named({
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: undefined
                },
                name: this.casingsGenerator.generateName(typeId),
                typeId,
                default: undefined,
                inline: false,
                displayName
            }),
            inlinedTypes
        }
    }

    public setGlobalHeaders(globalHeaders: FernIr.HttpHeader[]): void {
        this.globalHeaderNames = globalHeaders.map((header) => header.name.wireValue)
    }

    public getDisplayNameForTag(tag: string): string {
        if (Object.keys(this.tagToDisplayName).length === 0) {
            for (const tag of this.spec.tags ?? []) {
                const displayNameExtension = new DisplayNameExtension({
                    breadcrumbs: ['tags', tag.name],
                    tag,
                    context: this
                })
                const tagDisplayName = displayNameExtension.convert()?.displayName ?? tag.name
                this.tagToDisplayName[tag.name] = tagDisplayName
            }
        }
        return this.tagToDisplayName[tag] ?? tag
    }
}
