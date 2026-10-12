import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

export type ItemIteratorPagination = Extract<FernIr.Pagination, { type: "cursor" | "offset" }>;

/**
 * Returns the pagination of an endpoint whose method returns a `CursorItemIterator` or
 * `OffsetItemIterator` instead of the response body.
 */
export function getItemIteratorPagination(endpoint: FernIr.HttpEndpoint): ItemIteratorPagination | undefined {
    const pagination = endpoint.pagination;
    if (pagination?.type === "cursor" || pagination?.type === "offset") {
        return pagination;
    }
    return undefined;
}

export function getItemIteratorClassName(pagination: ItemIteratorPagination): string {
    return pagination.type === "cursor" ? "CursorItemIterator" : "OffsetItemIterator";
}

export function getItemIteratorReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
}): ruby.Type | undefined {
    const pagination = getItemIteratorPagination(endpoint);
    if (pagination == null) {
        return undefined;
    }
    return ruby.Type.class_({
        name: getItemIteratorClassName(pagination),
        modules: [context.getRootModuleName(), "Internal"]
    });
}

/**
 * Describes what a paginated method returns, how to read each page's full response, and when
 * requests are sent and API errors are raised.
 */
export function getItemIteratorDocs({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
}): string | undefined {
    const pagination = getItemIteratorPagination(endpoint);
    if (pagination == null) {
        return undefined;
    }
    const iteratorName = `${context.getRootModuleName()}::Internal::${getItemIteratorClassName(pagination)}`;
    const itemsField = context.caseConverter.snakeSafe(pagination.results.property.name);
    const itemType = getListItemType(pagination.results.property.valueType);
    const items = itemType != null ? `each \`${writeType(context, itemType)}\`` : "each item";
    const responseBody = endpoint.response?.body;
    const page =
        responseBody?.type === "json"
            ? `a \`${writeType(context, responseBody.value.responseBodyType)}\``
            : "the full response";

    const paragraphs = [
        `Returns a \`${iteratorName}\` that yields ${items} in the \`${itemsField}\` field of every page, ` +
            "requesting pages as they are needed. Call `pages` on it to get each page as " +
            `${page}, including its other fields.`
    ];
    if (context.customConfig.fetchFirstPageOnCall === true) {
        paragraphs.push(
            "The request for the first page is sent by this call, so an API error for the first page is raised here. " +
                "Later pages are requested while iterating, and an API error for one of them is raised by the loop."
        );
    } else {
        paragraphs.push(
            "No request is sent by this call. The first page is requested when you start iterating (or call " +
                "`load_first_page`), so an API error is raised by the loop (or by `load_first_page`), not by this call."
        );
    }
    return paragraphs.join("\n\n");
}

function getListItemType(reference: FernIr.TypeReference): FernIr.TypeReference | undefined {
    if (reference.type !== "container") {
        return undefined;
    }
    const container = reference.container;
    switch (container.type) {
        case "list":
            return container.list;
        case "set":
            return container.set;
        case "optional":
            return getListItemType(container.optional);
        case "nullable":
            return getListItemType(container.nullable);
        default:
            return undefined;
    }
}

function writeType(context: SdkGeneratorContext, reference: FernIr.TypeReference): string {
    const writer = new ruby.Writer({ customConfig: context.customConfig });
    context.typeMapper.convert({ reference }).write(writer);
    return writer.buffer.trim();
}
