import { CaseConverter, getWireValue, NameInput } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { EndpointSignatureInfo } from "../EndpointSignatureInfo.js";
import { PaginationInfo } from "../PaginationInfo.js";

const PAGE_REQUEST_VARIABLE_NAME = "pageRequest";
const PAGE_REQUEST_CURSOR_NAME = `${PAGE_REQUEST_VARIABLE_NAME}.Cursor`;
const PAGE_REQUEST_RESPONSE_NAME = `${PAGE_REQUEST_VARIABLE_NAME}.Response`;
const PAGED_REQUEST_VARIABLE_NAME = "nextRequest";

/**
 * A page property that lives on the request body. The pager advances the page by setting the field on
 * a copy of the request before every call, so that the caller's request is left untouched.
 */
interface RequestBodyPageProperty {
    requestParameterName: string;
    /** e.g. request.Cursor */
    requestReference: string;
    /** e.g. nextRequest.Cursor */
    pagedRequestReference: string;
}

export function getPaginationInfo({
    context,
    pagination,
    signature,
    endpoint,
    callerReference,
    errorDecoder
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    signature: EndpointSignatureInfo;
    endpoint: FernIr.HttpEndpoint;
    callerReference: go.AstNode;
    errorDecoder: go.CodeBlock | undefined;
}): PaginationInfo {
    const pageType = getPageType({ context, pagination });
    const nextPageType = getNextPageType({ context, pagination });
    const pageRequestType = getPageRequestType({ context, pageType });
    const requestPagePropertyReference = getPagePropertyReference({
        variableName: getRequestVariableName({ signature }),
        pagination,
        caseConverter: context.caseConverter
    });
    const requestBodyPageProperty = getRequestBodyPageProperty({ context, pagination, signature });
    const pagePropertyFormat = getPageValueFormat({ context, pagination });
    return {
        prepareCall: getPrepareCall({
            context,
            pagination,
            signature,
            pageType,
            pageRequestType,
            pagePropertyFormat,
            requestBodyPageProperty,
            endpoint,
            errorDecoder
        }),
        readPageResponse: getReadPageResponse({
            context,
            pagination,
            signature,
            pageType,
            nextPageType,
            requestPagePropertyReference,
            requestBodyPageProperty
        }),
        initializePager: getInitializePager({ context, pagination, callerReference }),
        callGetPage: getCallGetPage({ pagination, pageType, requestPagePropertyReference })
    };
}

function getPrepareCall({
    context,
    pagination,
    signature,
    pageType,
    pageRequestType,
    pagePropertyFormat,
    requestBodyPageProperty,
    endpoint,
    errorDecoder
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    signature: EndpointSignatureInfo;
    pageType: go.Type;
    pageRequestType: go.Type;
    pagePropertyFormat: go.AstNode;
    requestBodyPageProperty: RequestBodyPageProperty | undefined;
    endpoint: FernIr.HttpEndpoint;
    errorDecoder: go.CodeBlock | undefined;
}): go.AstNode {
    const pagePropertySetter = getPagePropertySetter({
        pagination,
        pageType,
        pagePropertyFormat,
        requestBodyPageProperty
    });
    const requestReference =
        requestBodyPageProperty != null
            ? go.codeblock(`&${PAGED_REQUEST_VARIABLE_NAME}`)
            : signature.request?.getRequestReference();
    return go.codeblock((writer) => {
        writer.write("prepareCall := ");
        writer.writeNode(
            go.func({
                parameters: [
                    go.parameter({
                        name: PAGE_REQUEST_VARIABLE_NAME,
                        type: pageRequestType
                    })
                ],
                return_: [go.Type.pointer(go.Type.reference(context.caller.getCallParamsTypeReference()))],
                body: go.codeblock((writer) => {
                    writer.writeNode(pagePropertySetter);
                    writer.writeLine("nextURL := endpointURL");
                    if (endpoint.queryParameters.length > 0) {
                        encodeQuery({ writer });
                    }
                    writer.write("return ");
                    writer.writeNode(
                        context.caller.instantiateCallParams({
                            endpoint,
                            optionsReference: go.codeblock("options"),
                            url: go.codeblock("nextURL"),
                            request: requestReference,
                            response: go.codeblock(PAGE_REQUEST_RESPONSE_NAME),
                            errorCodes: errorDecoder != null ? go.codeblock("errorCodes") : undefined
                        })
                    );
                }),
                multiline: false
            })
        );
        writer.newLine();
    });
}

function getReadPageResponse({
    context,
    pagination,
    signature,
    pageType,
    nextPageType,
    requestPagePropertyReference,
    requestBodyPageProperty
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    signature: EndpointSignatureInfo;
    pageType: go.Type;
    nextPageType: go.Type | undefined;
    requestPagePropertyReference: go.AstNode;
    requestBodyPageProperty: RequestBodyPageProperty | undefined;
}): go.AstNode {
    const initializer = getPagePropertyInitializer({
        pagination,
        pageType,
        requestPagePropertyReference,
        requestBodyPageProperty,
        useItemIndex: pagination.type === "offset" && usesItemIndexOffset({ context, offset: pagination })
    });
    const responseType = signature.returnType ?? go.Type.any();
    return go.codeblock((writer) => {
        if (initializer != null) {
            writer.writeNode(initializer);
            writer.newLine();
        }
        writer.write("readPageResponse := ");
        writer.writeNode(
            go.func({
                parameters: [
                    go.parameter({
                        name: "response",
                        type: responseType
                    })
                ],
                return_: [
                    getPageResponseType({
                        context,
                        pagination,
                        pageType,
                        responseType
                    })
                ],
                body: getReadPageResponseBody({
                    context,
                    pagination,
                    pageType,
                    nextPageType,
                    responseType
                }),
                multiline: false
            })
        );
    });
}

function getInitializePager({
    context,
    pagination,
    callerReference
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    callerReference: go.AstNode;
}): go.AstNode {
    return go.codeblock((writer) => {
        writer.write("pager := ");
        writer.writeNode(instantiatePager({ context, pagination, callerReference }));
        writer.newLine();
    });
}

function instantiatePager({
    context,
    pagination,
    callerReference
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    callerReference: go.AstNode;
}): go.AstNode {
    const arguments_: go.AstNode[] = [callerReference, go.codeblock("prepareCall"), go.codeblock("readPageResponse")];
    switch (pagination.type) {
        case "cursor":
            return go.invokeFunc({
                func: go.typeReference({
                    name: "NewCursorPager",
                    importPath: context.getInternalImportPath()
                }),
                arguments_
            });
        case "offset":
            return go.invokeFunc({
                func: go.typeReference({
                    name: "NewOffsetPager",
                    importPath: context.getInternalImportPath()
                }),
                arguments_
            });
        case "custom":
        case "uri":
        case "path":
            return go.TypeInstantiation.nop();
        default:
            assertNever(pagination);
    }
}

function getCallGetPage({
    pagination,
    pageType,
    requestPagePropertyReference
}: {
    pagination: FernIr.Pagination;
    pageType: go.Type;
    requestPagePropertyReference: go.AstNode;
}): go.AstNode {
    return go.codeblock((writer) => {
        writer.write("return ");
        writer.writeNode(invokeGetPage({ pagination, pageType, requestPagePropertyReference }));
        writer.newLine();
    });
}

function invokeGetPage({
    pagination,
    pageType,
    requestPagePropertyReference
}: {
    pagination: FernIr.Pagination;
    pageType: go.Type;
    requestPagePropertyReference: go.AstNode;
}): go.AstNode {
    switch (pagination.type) {
        case "cursor":
            return go.invokeMethod({
                on: go.codeblock("pager"),
                method: "GetPage",
                arguments_: [go.codeblock("ctx"), requestPagePropertyReference],
                multiline: false
            });
        case "offset":
            return go.invokeMethod({
                on: go.codeblock("pager"),
                method: "GetPage",
                arguments_: [go.codeblock("ctx"), pageType.isOptional() ? go.codeblock("&next") : go.codeblock("next")],
                multiline: false
            });
        case "custom":
        case "uri":
        case "path":
            return go.TypeInstantiation.nop();
        default:
            assertNever(pagination);
    }
}

function getReadPageResponseBody({
    context,
    pagination,
    pageType,
    nextPageType,
    responseType
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    pageType: go.Type;
    nextPageType: go.Type | undefined;
    responseType: go.Type;
}): go.AstNode {
    switch (pagination.type) {
        case "cursor":
            return getReadPageResponseBodyForCursor({
                context,
                pagination,
                cursor: pagination,
                pageType,
                nextPageType,
                responseType
            });
        case "offset":
            return getReadPageResponseBodyForOffset({
                context,
                pagination,
                offset: pagination,
                pageType,
                responseType
            });
        case "custom":
        case "uri":
        case "path":
            return go.TypeInstantiation.nop();
        default:
            assertNever(pagination);
    }
}

function getReadPageResponseBodyForCursor({
    context,
    pagination,
    cursor,
    pageType,
    nextPageType,
    responseType
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    cursor: FernIr.CursorPagination;
    pageType: go.Type;
    nextPageType: go.Type | undefined;
    responseType: go.Type;
}): go.AstNode {
    const doneCondition = getCursorDoneCondition({ context, cursor });
    return go.codeblock((writer) => {
        writer.write("var zeroValue ");
        writer.writeNode(nextPageType ?? pageType);
        writer.newLine();
        writer.writeNode(getNextCursorSetter({ context, page: cursor.page, cursor: cursor.next }));
        writer.writeNode(getNextResultsSetter({ context, results: pagination.results }));
        writer.write("return ");
        writer.writeNode(
            go.TypeInstantiation.structPointer({
                typeReference: getPageResponseTypeReference({ context, pagination, pageType, responseType }),
                fields: [
                    {
                        name: "Results",
                        value: go.TypeInstantiation.reference(go.codeblock("results"))
                    },
                    {
                        name: "Response",
                        value: go.TypeInstantiation.reference(go.codeblock("response"))
                    },
                    {
                        name: "Next",
                        value: getNextReference({ pageType, nextPageType })
                    },
                    {
                        name: "Done",
                        value: go.TypeInstantiation.reference(go.codeblock(doneCondition))
                    }
                ]
            })
        );
    });
}

function getReadPageResponseBodyForOffset({
    context,
    pagination,
    offset,
    pageType,
    responseType
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    offset: FernIr.OffsetPagination;
    pageType: go.Type;
    responseType: go.Type;
}): go.AstNode {
    return go.codeblock((writer) => {
        const nextResultsSetter = getNextResultsSetter({ context, results: pagination.results });
        if (usesItemIndexOffset({ context, offset })) {
            writer.writeNode(nextResultsSetter);
            writer.writeLine(getOffsetIncrementByResultCount({ pageType }));
        } else {
            writer.writeLine("next += 1");
            writer.writeNode(nextResultsSetter);
        }
        writer.write("return ");
        writer.writeNode(
            go.TypeInstantiation.structPointer({
                typeReference: getPageResponseTypeReference({ context, pagination, pageType, responseType }),
                fields: [
                    {
                        name: "Results",
                        value: go.TypeInstantiation.reference(go.codeblock("results"))
                    },
                    {
                        name: "Response",
                        value: go.TypeInstantiation.reference(go.codeblock("response"))
                    },
                    {
                        name: "Next",
                        value: go.TypeInstantiation.reference(go.codeblock(pageType.isOptional() ? "&next" : "next"))
                    }
                ]
            })
        );
    });
}

// The offset advances by the number of items in the page, so the results must be read first.
function getOffsetIncrementByResultCount({ pageType }: { pageType: go.Type }): string {
    const underlying = pageType.underlying();
    switch (underlying.internalType.type) {
        case "int64":
            return "next += int64(len(results))";
        case "float64":
            return "next += float64(len(results))";
        default:
            return "next += int(len(results))";
    }
}

function usesItemIndexOffset({
    context,
    offset
}: {
    context: SdkGeneratorContext;
    offset: FernIr.OffsetPagination;
}): boolean {
    return offset.step != null && context.customConfig.offsetSemantics === "item-index";
}

function getNextCursorSetter({
    context,
    page,
    cursor
}: {
    context: SdkGeneratorContext;
    page: FernIr.RequestProperty;
    cursor: FernIr.ResponseProperty;
}): go.AstNode {
    return getResponsePropertySetter({
        context,
        responseProperty: cursor,
        variableName: "next",
        dereference: dereferencesNextCursor({ page, cursor })
    });
}

function dereferencesNextCursor({
    page,
    cursor
}: {
    page: FernIr.RequestProperty;
    cursor: FernIr.ResponseProperty;
}): boolean {
    return page.property.valueType.type !== cursor.property.valueType.type;
}

/**
 * APIs commonly signal the last page with an empty cursor rather than a null one, so an empty
 * string is terminal in addition to the zero value. Non-string cursors (e.g. uuid, int) are
 * unaffected: their zero value already covers termination.
 */
function getCursorDoneCondition({
    context,
    cursor
}: {
    context: SdkGeneratorContext;
    cursor: FernIr.CursorPagination;
}): string {
    const zeroValueCondition = "next == zeroValue";
    if (
        !isNilableStringCursor({ context, cursor: cursor.next }) ||
        dereferencesNextCursor({ page: cursor.page, cursor: cursor.next })
    ) {
        return zeroValueCondition;
    }
    // Short-circuits before dereferencing a nil cursor.
    return `${zeroValueCondition} || *next == ""`;
}

/**
 * Whether the cursor is a string that generates as a Go pointer, so that it can hold an empty
 * string in addition to nil. Optionality is resolved through named aliases, which generate as the
 * pointer type they alias (e.g. `type Cursor = *string`) rather than as a Go optional.
 *
 * The IR property is the source of truth for the emitted type because `next` is always declared
 * from the response cursor property's getter.
 */
function isNilableStringCursor({
    context,
    cursor
}: {
    context: SdkGeneratorContext;
    cursor: FernIr.ResponseProperty;
}): boolean {
    const valueType = cursor.property.valueType;
    if (!context.isPrimitive({ typeReference: valueType, primitive: FernIr.PrimitiveTypeV1.String })) {
        return false;
    }
    return context.isOptional(valueType) || context.isNullable(valueType);
}

function getNextResultsSetter({
    context,
    results
}: {
    context: SdkGeneratorContext;
    results: FernIr.ResponseProperty;
}): go.AstNode {
    return getResponsePropertySetter({
        context,
        responseProperty: results,
        variableName: "results"
    });
}

function getResponsePropertySetter({
    context,
    responseProperty,
    variableName,
    dereference
}: {
    context: SdkGeneratorContext;
    responseProperty: FernIr.ResponseProperty;
    variableName: string;
    dereference?: boolean;
}): go.AstNode {
    const responsePropertyType = context.goTypeMapper.convert({ reference: responseProperty.property.valueType });
    const responsePropertyPath = responseProperty.propertyPath ?? [];
    if (responsePropertyType.isOptional() && responsePropertyPath.length > 0) {
        return go.codeblock((writer) => {
            writer.write(`var ${variableName} `);
            writer.writeNode(responsePropertyType);
            writer.newLine();
            writer.write("if ");
            writer.writeNode(
                getPropertyNilCheckCondition({
                    variableName: "response",
                    propertyPath: responsePropertyPath.map((item) => item.name),
                    caseConverter: context.caseConverter
                })
            );
            writer.writeLine(" {");
            writer.indent();
            writer.write(`${variableName} = `);
            writer.writeNode(
                getPropertyReference({
                    variableName: "response",
                    propertyPath: responsePropertyPath.map((item) => item.name),
                    name: responseProperty.property.name,
                    dereference,
                    caseConverter: context.caseConverter
                })
            );
            writer.newLine();
            writer.dedent();
            writer.writeLine("}");
        });
    }
    return go.codeblock((writer) => {
        writer.write(`${variableName} := `);
        writer.writeNode(
            getResponsePropertyReference({
                results: responseProperty,
                withGetter: context.customConfig.gettersPassByValue !== true,
                caseConverter: context.caseConverter
            })
        );
        writer.newLine();
    });
}

function getPagePropertySetter({
    pagination,
    pageType,
    pagePropertyFormat,
    requestBodyPageProperty
}: {
    pagination: FernIr.Pagination;
    pageType: go.Type;
    pagePropertyFormat: go.AstNode;
    requestBodyPageProperty: RequestBodyPageProperty | undefined;
}): go.AstNode {
    switch (pagination.type) {
        case "cursor":
        case "offset":
            if (requestBodyPageProperty != null) {
                return go.codeblock((writer) => {
                    writer.writeLine(
                        `${PAGED_REQUEST_VARIABLE_NAME} := *${requestBodyPageProperty.requestParameterName}`
                    );
                    writer.writeLine(`${requestBodyPageProperty.pagedRequestReference} = ${PAGE_REQUEST_CURSOR_NAME}`);
                });
            }
            return go.codeblock((writer) => {
                if (pageType.isOptional()) {
                    writer.writeLine(`if ${PAGE_REQUEST_CURSOR_NAME} != nil {`);
                    writer.indent();
                    writer.writeNode(
                        setQueryParameter({
                            key: getWireValue(pagination.page.property.name),
                            value: pagePropertyFormat
                        })
                    );
                    writer.newLine();
                    writer.dedent();
                    writer.writeLine("}");
                    return;
                }
                writer.writeNode(
                    setQueryParameter({
                        key: getWireValue(pagination.page.property.name),
                        value: pagePropertyFormat
                    })
                );
                writer.newLine();
            });
        case "custom":
        case "uri":
        case "path":
            return go.TypeInstantiation.nop();
        default:
            assertNever(pagination);
    }
}

function getPagePropertyInitializer({
    pagination,
    pageType,
    requestPagePropertyReference,
    requestBodyPageProperty,
    useItemIndex
}: {
    pagination: FernIr.Pagination;
    pageType: go.Type;
    requestPagePropertyReference: go.AstNode;
    requestBodyPageProperty: RequestBodyPageProperty | undefined;
    useItemIndex: boolean;
}): go.AstNode | undefined {
    switch (pagination.type) {
        case "offset": {
            if (requestBodyPageProperty != null) {
                return getRequestBodyOffsetInitializer({
                    pageType,
                    requestReference: requestBodyPageProperty.requestReference,
                    useItemIndex
                });
            }
            return go.codeblock((writer) => {
                if (pageType.isOptional()) {
                    writer.writeNode(getOffsetInitializer({ pageType, useItemIndex }));
                    writer.newLine();
                    writer.write("if ");
                    writer.writeNode(
                        hasQueryParameter({
                            key: getWireValue(pagination.page.property.name)
                        })
                    );
                    writer.writeLine(" {");
                    writer.indent();
                    writer.writeNode(
                        getPageValueParser({
                            pageType,
                            valueVariable: "next",
                            queryParameterValue: getQueryParameter({ key: getWireValue(pagination.page.property.name) })
                        })
                    );
                    writer.dedent();
                    writer.writeLine("}");
                    return;
                }
                writer.write("next := ");
                writer.writeNode(requestPagePropertyReference);
                writer.newLine();
            });
        }
        case "cursor":
        case "custom":
        case "uri":
        case "path":
            return undefined;
        default:
            assertNever(pagination);
    }
}

function getRequestBodyOffsetInitializer({
    pageType,
    requestReference,
    useItemIndex
}: {
    pageType: go.Type;
    requestReference: string;
    useItemIndex: boolean;
}): go.AstNode {
    return go.codeblock((writer) => {
        if (!pageType.isOptional()) {
            writer.writeLine(`next := ${requestReference}`);
            return;
        }
        writer.writeNode(getOffsetInitializer({ pageType, useItemIndex }));
        writer.newLine();
        writer.writeLine(`if ${requestReference} != nil {`);
        writer.indent();
        writer.writeLine(`next = *${requestReference}`);
        writer.dedent();
        writer.writeLine("}");
    });
}

// Item-index offsets address records rather than pages, so they start at 0.
function getOffsetInitializer({ pageType, useItemIndex }: { pageType: go.Type; useItemIndex: boolean }): go.AstNode {
    const underlying = pageType.underlying();
    const initialOffset = useItemIndex ? 0 : 1;
    switch (underlying.internalType.type) {
        case "string":
            return go.codeblock(`var next string = "${initialOffset}"`);
        case "uuid":
            return go.codeblock("var next uuid.UUID");
        case "int":
            return go.codeblock(`next := ${initialOffset}`);
        case "int64":
            return go.codeblock(`var next int64 = ${initialOffset}`);
        case "float64":
            return go.codeblock(`var next float64 = ${initialOffset}`);
        default:
            return go.codeblock(`next := ${initialOffset}`);
    }
}

function getPageValueParser({
    pageType,
    valueVariable,
    queryParameterValue
}: {
    pageType: go.Type;
    valueVariable: string;
    queryParameterValue: go.AstNode;
}): go.AstNode {
    const underlying = pageType.underlying();

    return go.codeblock((writer) => {
        writer.writeLine("var err error");

        switch (underlying.internalType.type) {
            case "string":
                writer.write(`${valueVariable} = `);
                writer.writeNode(queryParameterValue);
                return;

            case "uuid":
                writer.write(`if ${valueVariable}, err = `);
                writer.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "Parse",
                            importPath: "github.com/google/uuid"
                        }),
                        arguments_: [queryParameterValue],
                        multiline: false
                    })
                );
                break;

            case "int":
                writer.write(`if ${valueVariable}, err = `);
                writer.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "Atoi",
                            importPath: "strconv"
                        }),
                        arguments_: [queryParameterValue],
                        multiline: false
                    })
                );
                break;

            case "int64":
                writer.write(`if ${valueVariable}, err = `);
                writer.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "ParseInt",
                            importPath: "strconv"
                        }),
                        arguments_: [queryParameterValue, go.codeblock("10"), go.codeblock("64")],
                        multiline: false
                    })
                );
                break;

            case "float64":
                writer.write(`if ${valueVariable}, err = `);
                writer.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "ParseFloat",
                            importPath: "strconv"
                        }),
                        arguments_: [queryParameterValue, go.codeblock("64")],
                        multiline: false
                    })
                );
                break;

            default:
                // Fallback to Atoi for unknown types
                writer.write(`if ${valueVariable}, err = `);
                writer.writeNode(
                    go.invokeFunc({
                        func: go.typeReference({
                            name: "Atoi",
                            importPath: "strconv"
                        }),
                        arguments_: [queryParameterValue],
                        multiline: false
                    })
                );
                break;
        }

        // For types that can fail parsing, add error handling
        const needsErrorHandling = ["uuid", "int", "int64", "float64"].includes(underlying.internalType.type);
        if (needsErrorHandling) {
            writer.writeLine("; err != nil {");
            writer.indent();
            writer.writeLine("return nil, err");
            writer.dedent();
            writer.writeLine("}");
        }
    });
}

export function getPageType({
    context,
    pagination
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
}): go.Type {
    switch (pagination.type) {
        case "cursor":
        case "offset":
            return context.goTypeMapper.convert({ reference: pagination.page.property.valueType });
        case "custom":
        case "uri":
        case "path":
            return go.Type.any();
        default:
            assertNever(pagination);
    }
}

function getNextPageType({
    context,
    pagination
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
}): go.Type | undefined {
    switch (pagination.type) {
        case "cursor":
            return context.goTypeMapper.convert({ reference: pagination.next.property.valueType });
        case "offset": {
            return context.goTypeMapper.convert({ reference: pagination.page.property.valueType });
        }
        case "custom":
        case "uri":
        case "path":
            return undefined;
        default:
            assertNever(pagination);
    }
}

function getPageRequestType({ context, pageType }: { context: SdkGeneratorContext; pageType: go.Type }): go.Type {
    return go.Type.pointer(
        go.Type.reference(
            go.typeReference({
                name: "PageRequest",
                importPath: context.getCoreImportPath(),
                generics: [pageType]
            })
        )
    );
}

function getPageResponseType({
    context,
    pagination,
    pageType,
    responseType
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    pageType: go.Type;
    responseType: go.Type;
}): go.Type {
    return go.Type.pointer(
        go.Type.reference(getPageResponseTypeReference({ context, pagination, pageType, responseType }))
    );
}

function getPageResponseTypeReference({
    context,
    pagination,
    pageType,
    responseType
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    pageType: go.Type;
    responseType: go.Type;
}): go.TypeReference {
    return go.typeReference({
        name: "PageResponse",
        importPath: context.getCoreImportPath(),
        generics: [pageType, getResponseElementType({ context, pagination }), responseType]
    });
}

function getPageValueFormat({
    context,
    pagination
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
}): go.AstNode {
    switch (pagination.type) {
        case "cursor":
        case "offset": {
            const value = context.goValueFormatter.convert({
                reference: pagination.page.property.valueType,
                value: go.codeblock(PAGE_REQUEST_CURSOR_NAME)
            });
            return value.formatted;
        }
        case "custom":
        case "uri":
        case "path":
            return go.Type.any();
        default:
            assertNever(pagination);
    }
}

function getResponseElementType({
    context,
    pagination
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
}): go.Type {
    // Resolve the iterable element at the IR level so named aliases to a
    // list/set (e.g. `UserList = list<User>`) unwrap to their element type.
    // This must match getPaginationValueType, which produces the endpoint's
    // returned *core.Page[...] element type, so the pager's PageResponse and
    // the endpoint signature agree on the same element type.
    const iterableType = context.maybeUnwrapIterable(pagination.results.property.valueType);
    if (iterableType != null) {
        return context.goTypeMapper.convert({ reference: iterableType });
    }
    return context.goTypeMapper.convert({ reference: pagination.results.property.valueType });
}

function getPagePropertyReference({
    variableName,
    pagination,
    withGetter,
    caseConverter
}: {
    variableName: string;
    pagination: FernIr.Pagination;
    withGetter?: boolean;
    caseConverter: CaseConverter;
}): go.AstNode {
    switch (pagination.type) {
        case "cursor":
        case "offset": {
            return getPropertyReference({
                variableName,
                propertyPath: pagination.page.propertyPath?.map((item) => item.name) ?? [],
                name: pagination.page.property.name,
                withGetter,
                caseConverter
            });
        }
        case "custom":
        case "uri":
        case "path":
            return go.TypeInstantiation.nop();
        default:
            assertNever(pagination);
    }
}

function getRequestBodyPageProperty({
    context,
    pagination,
    signature
}: {
    context: SdkGeneratorContext;
    pagination: FernIr.Pagination;
    signature: EndpointSignatureInfo;
}): RequestBodyPageProperty | undefined {
    switch (pagination.type) {
        case "cursor":
        case "offset": {
            if (pagination.page.property.type !== "body" || signature.request == null) {
                return undefined;
            }
            const requestParameterName = signature.request.getRequestParameterName();
            const fieldName = context.getFieldName(pagination.page.property.name);
            return {
                requestParameterName,
                requestReference: `${requestParameterName}.${fieldName}`,
                pagedRequestReference: `${PAGED_REQUEST_VARIABLE_NAME}.${fieldName}`
            };
        }
        case "custom":
        case "uri":
        case "path":
            return undefined;
        default:
            assertNever(pagination);
    }
}

function getRequestVariableName({ signature }: { signature: EndpointSignatureInfo }): string {
    return signature.request?.getRequestParameterName() ?? "request";
}

function getResponsePropertyReference({
    results,
    withGetter,
    caseConverter
}: {
    results: FernIr.ResponseProperty;
    withGetter?: boolean;
    caseConverter: CaseConverter;
}): go.AstNode {
    return getPropertyReference({
        variableName: "response",
        propertyPath: results.propertyPath?.map((item) => item.name) ?? [],
        name: results.property.name,
        withGetter,
        caseConverter
    });
}

function getPropertyReference({
    variableName,
    propertyPath,
    name,
    withGetter,
    dereference,
    caseConverter
}: {
    variableName: string;
    propertyPath: NameInput[] | undefined;
    name: NameInput;
    withGetter?: boolean;
    dereference?: boolean;
    caseConverter: CaseConverter;
}): go.AstNode {
    const fullPath = [...(propertyPath ?? []), name];
    return go.codeblock((writer) => {
        if (dereference) {
            writer.write("*");
        }
        writer.write(
            `${variableName}.${fullPath.map((name) => getPropertyAccessor({ name, withGetter, caseConverter })).join(".")}`
        );
    });
}

function getPropertyNilCheckCondition({
    variableName,
    propertyPath,
    caseConverter
}: {
    variableName: string;
    propertyPath: NameInput[];
    caseConverter: CaseConverter;
}): go.AstNode {
    const checks = propertyPath.map((_, index) => {
        const pathSegment = propertyPath
            .slice(0, index + 1)
            .map((name) => getPropertyAccessor({ name, caseConverter }))
            .join(".");
        return `${variableName}.${pathSegment} != nil`;
    });

    return go.codeblock((writer) => {
        writer.write(checks.join(" && "));
    });
}

function setQueryParameter({ key, value }: { key: string; value: go.AstNode }): go.CodeBlock {
    return go.codeblock((writer) => {
        writer.write("queryParams.Set(");
        writer.writeNode(go.TypeInstantiation.string(key));
        writer.write(", ");
        writer.writeNode(value);
        writer.write(")");
    });
}

function hasQueryParameter({ key }: { key: string }): go.AstNode {
    return go.codeblock((writer) => {
        writer.write("queryParams.Has(");
        writer.writeNode(go.TypeInstantiation.string(key));
        writer.write(")");
    });
}

function getQueryParameter({ key }: { key: string }): go.AstNode {
    return go.codeblock((writer) => {
        writer.write("queryParams.Get(");
        writer.writeNode(go.TypeInstantiation.string(key));
        writer.write(")");
    });
}

function encodeQuery({ writer }: { writer: go.Writer }): void {
    writer.writeLine("if len(queryParams) > 0 {");
    writer.indent();
    writer.writeLine('nextURL += "?" + queryParams.Encode()');
    writer.dedent();
    writer.writeLine("}");
}

function getPropertyAccessor({
    name,
    withGetter,
    caseConverter
}: {
    name: NameInput;
    withGetter?: boolean;
    caseConverter: CaseConverter;
}): string {
    if (withGetter) {
        return `Get${caseConverter.pascalUnsafe(name)}()`;
    }
    return caseConverter.pascalUnsafe(name);
}

function getNextReference({
    pageType,
    nextPageType
}: {
    pageType: go.Type;
    nextPageType: go.Type | undefined;
}): go.TypeInstantiation {
    if (nextPageType != null && nextPageType.internalType.type !== pageType.internalType.type) {
        return go.TypeInstantiation.reference(go.codeblock("&next"));
    }
    return go.TypeInstantiation.reference(go.codeblock("next"));
}
