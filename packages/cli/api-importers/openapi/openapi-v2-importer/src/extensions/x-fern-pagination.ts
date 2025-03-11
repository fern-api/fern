import { OpenAPIV3 } from "openapi-types";
import { z } from "zod";

import { AbstractConverter } from "../AbstractConverter";
import { AbstractExtension } from "../AbstractExtension";
import { ErrorCollector } from "../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../openapi_3_1/OpenAPIConverterContext3_1";

const REQUEST_PREFIX = "$request.";
const RESPONSE_PREFIX = "$response.";

const CursorPaginationExtensionSchema = z.object({
    cursor: z.string(),
    next_cursor: z.string(),
    results: z.string()
});

const OffsetPaginationExtensionSchema = z.object({
    offset: z.string(),
    results: z.string(),
    step: z.string().optional(),
    "has-next-page": z.string().optional()
});

const PaginationExtensionSchema = z.union([
    z.boolean(),
    CursorPaginationExtensionSchema,
    OffsetPaginationExtensionSchema
]);

export declare namespace FernPaginationExtension {
    export interface Args extends AbstractConverter.Args {
        operation: object;
        document: OpenAPIV3.Document;
    }

    export type Output =
        | {
              type: "cursor";
              cursor: string;
              nextCursor: string;
              results: string;
          }
        | {
              type: "offset";
              offset: string;
              results: string;
              step: string | undefined;
              hasNextPage: string | undefined;
          };
}

export class FernPaginationExtension extends AbstractExtension<
    OpenAPIConverterContext3_1,
    FernPaginationExtension.Output
> {
    private readonly operation: object;
    private readonly document: OpenAPIV3.Document;
    public readonly key = "x-fern-pagination";

    constructor({ breadcrumbs, operation, document }: FernPaginationExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
        this.document = document;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): FernPaginationExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        const result = PaginationExtensionSchema.safeParse(extensionValue);
        if (!result.success) {
            errorCollector.collect({
                message: `Invalid x-fern-pagination extension: ${result.error.message}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        if (typeof result.data === "boolean") {
            const topLevelPagination = this.getExtensionValue(this.document);
            if (topLevelPagination == null) {
                return undefined;
            }
            if (typeof topLevelPagination === "boolean") {
                errorCollector.collect({
                    message:
                        "Global pagination extension is a boolean, expected an object. Only endpoints may declare a boolean for x-fern-pagination.",
                    path: this.breadcrumbs
                });
                return undefined;
            }
            const result = PaginationExtensionSchema.safeParse(topLevelPagination);
            if (!result.success) {
                errorCollector.collect({
                    message: `Invalid x-fern-pagination extension: ${result.error.message}`,
                    path: this.breadcrumbs
                });
                return undefined;
            }
            if (typeof result.data === "boolean") {
                errorCollector.collect({
                    message: "Global pagination extension is a boolean, expected an object.",
                    path: this.breadcrumbs
                });
                return undefined;
            }
            return this.convertPaginationConfig(result.data, context);
        }

        if (typeof result.data === "boolean") {
            errorCollector.collect({
                message: "Pagination extension is a boolean with no global configuration.",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return this.convertPaginationConfig(result.data, context);
    }

    private convertPaginationConfig(
        config: z.infer<typeof CursorPaginationExtensionSchema> | z.infer<typeof OffsetPaginationExtensionSchema>,
        context: OpenAPIConverterContext3_1
    ): FernPaginationExtension.Output {
        const maybeCursorPagination = config as z.infer<typeof CursorPaginationExtensionSchema>;
        if ("cursor" in maybeCursorPagination) {
            return {
                type: "cursor",
                cursor: context.maybeTrimPrefix(maybeCursorPagination.cursor, REQUEST_PREFIX),
                nextCursor: context.maybeTrimPrefix(maybeCursorPagination.next_cursor, RESPONSE_PREFIX),
                results: context.maybeTrimPrefix(maybeCursorPagination.results, RESPONSE_PREFIX)
            };
        }

        const offsetPagination = config as z.infer<typeof OffsetPaginationExtensionSchema>;
        return {
            type: "offset",
            offset: context.maybeTrimPrefix(offsetPagination.offset, REQUEST_PREFIX),
            results: context.maybeTrimPrefix(offsetPagination.results, RESPONSE_PREFIX),
            step:
                offsetPagination.step != null
                    ? context.maybeTrimPrefix(offsetPagination.step, REQUEST_PREFIX)
                    : undefined,
            hasNextPage:
                offsetPagination["has-next-page"] != null
                    ? context.maybeTrimPrefix(offsetPagination["has-next-page"], RESPONSE_PREFIX)
                    : undefined
        };
    }
}
