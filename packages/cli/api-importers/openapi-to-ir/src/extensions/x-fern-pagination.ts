import { OpenAPIV3 } from "openapi-types"
import { z } from "zod"

import { AbstractConverterContext, AbstractExtension } from "@fern-api/v2-importer-commons"

import {
    CursorPaginationExtensionSchema,
    OffsetPaginationExtensionSchema,
    PaginationExtensionSchema
} from "../schemas/PaginationSchema"

const REQUEST_PREFIX = "$request."
const RESPONSE_PREFIX = "$response."

export declare namespace FernPaginationExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object
        document: OpenAPIV3.Document
    }

    export type Output =
        | {
              type: "cursor"
              cursor: string
              nextCursor: string
              results: string
          }
        | {
              type: "offset"
              offset: string
              results: string
              step: string | undefined
              hasNextPage: string | undefined
          }
}

export class FernPaginationExtension extends AbstractExtension<FernPaginationExtension.Output> {
    private readonly operation: object
    private readonly document: OpenAPIV3.Document
    public readonly key = "x-fern-pagination"

    constructor({ breadcrumbs, operation, document, context }: FernPaginationExtension.Args) {
        super({ breadcrumbs, context })
        this.operation = operation
        this.document = document
    }

    public convert(): FernPaginationExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation)
        if (extensionValue == null) {
            return undefined
        }

        const result = PaginationExtensionSchema.safeParse(extensionValue)
        if (!result.success) {
            this.context.errorCollector.collect({
                message: `Invalid x-fern-pagination extension: ${result.error.message}`,
                path: this.breadcrumbs
            })
            return undefined
        }

        if (typeof result.data === "boolean") {
            const topLevelPagination = this.getExtensionValue(this.document)
            if (topLevelPagination == null) {
                return undefined
            }
            if (typeof topLevelPagination === "boolean") {
                this.context.errorCollector.collect({
                    message:
                        "Global pagination extension is a boolean, expected an object. Only endpoints may declare a boolean for x-fern-pagination.",
                    path: this.breadcrumbs
                })
                return undefined
            }
            const result = PaginationExtensionSchema.safeParse(topLevelPagination)
            if (!result.success) {
                this.context.errorCollector.collect({
                    message: `Invalid x-fern-pagination extension: ${result.error.message}`,
                    path: this.breadcrumbs
                })
                return undefined
            }
            if (typeof result.data === "boolean") {
                this.context.errorCollector.collect({
                    message: "Global pagination extension is a boolean, expected an object.",
                    path: this.breadcrumbs
                })
                return undefined
            }
            return this.convertPaginationConfig({ config: result.data })
        }

        if (typeof result.data === "boolean") {
            this.context.errorCollector.collect({
                message: "Pagination extension is a boolean with no global configuration.",
                path: this.breadcrumbs
            })
            return undefined
        }

        return this.convertPaginationConfig({ config: result.data })
    }

    private convertPaginationConfig({
        config
    }: {
        config: z.infer<typeof CursorPaginationExtensionSchema> | z.infer<typeof OffsetPaginationExtensionSchema>
    }): FernPaginationExtension.Output {
        const maybeCursorPagination = config as z.infer<typeof CursorPaginationExtensionSchema>
        if ("cursor" in maybeCursorPagination) {
            return {
                type: "cursor",
                cursor: AbstractConverterContext.maybeTrimPrefix(maybeCursorPagination.cursor, REQUEST_PREFIX),
                nextCursor: AbstractConverterContext.maybeTrimPrefix(
                    maybeCursorPagination.next_cursor,
                    RESPONSE_PREFIX
                ),
                results: AbstractConverterContext.maybeTrimPrefix(maybeCursorPagination.results, RESPONSE_PREFIX)
            }
        }

        const offsetPagination = config as z.infer<typeof OffsetPaginationExtensionSchema>
        return {
            type: "offset",
            offset: AbstractConverterContext.maybeTrimPrefix(offsetPagination.offset, REQUEST_PREFIX),
            results: AbstractConverterContext.maybeTrimPrefix(offsetPagination.results, RESPONSE_PREFIX),
            step:
                offsetPagination.step != null
                    ? AbstractConverterContext.maybeTrimPrefix(offsetPagination.step, REQUEST_PREFIX)
                    : undefined,
            hasNextPage:
                offsetPagination["has-next-page"] != null
                    ? AbstractConverterContext.maybeTrimPrefix(offsetPagination["has-next-page"], RESPONSE_PREFIX)
                    : undefined
        }
    }
}
