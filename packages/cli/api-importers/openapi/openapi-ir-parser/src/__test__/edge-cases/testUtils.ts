import { Source } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../../schema/convertSchemas";
import { SchemaParserContext } from "../../schema/SchemaParserContext";

export function convertForTest(params: {
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    context: SchemaParserContext;
    source: Source;
    breadcrumbs?: string[];
    wrapAsOptional?: boolean;
    wrapAsNullable?: boolean;
    referencedAsRequest?: boolean;
    propertiesToExclude?: Set<string>;
    fallback?: string | number | boolean | unknown[];
    namespace?: string;
}) {
    const {
        schema,
        context,
        source,
        breadcrumbs = ["Test"],
        wrapAsOptional = false,
        wrapAsNullable = false,
        referencedAsRequest = false,
        propertiesToExclude = new Set<string>(),
        fallback,
        namespace = undefined
    } = params;
    return convertSchema(
        schema,
        wrapAsOptional,
        wrapAsNullable,
        context,
        breadcrumbs,
        source,
        namespace,
        referencedAsRequest,
        propertiesToExclude,
        fallback
    );
}
