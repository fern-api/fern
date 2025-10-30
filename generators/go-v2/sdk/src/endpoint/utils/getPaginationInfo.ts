import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import {
    CursorPagination,
    HttpEndpoint,
    Name,
    Pagination,
    RequestProperty,
    ResponseProperty
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointSignatureInfo } from "../EndpointSignatureInfo";
import { PaginationInfo } from "../PaginationInfo";

const PAGE_REQUEST_VARIABLE_NAME = "pageRequest";
const PAGE_REQUEST_CURSOR_NAME = `${PAGE_REQUEST_VARIABLE_NAME}.Cursor`;
const PAGE_REQUEST_RESPONSE_NAME = `${PAGE_REQUEST_VARIABLE_NAME}.Response`;

export function getPaginationInfo({
    context,
    pagination,
    signature,
    endpoint,
    callerReference,
    errorDecoder
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
    signature: EndpointSignatureInfo;
    endpoint: HttpEndpoint;
    callerReference: go.AstNode;
    errorDecoder: go.CodeBlock | undefined;
}): PaginationInfo {
    const pageType = getPageType({ context, pagination });
    const nextPageType = getNextPageType({ context, pagination });
    const pageRequestType = getPageRequestType({ context, pageType });
    const requestPagePropertyReference = getPagePropertyReference({ variableName: "request", pagination });
    const pagePropertyFormat = getPageValueFormat({ context, pagination });
    const requestPagePropertyFormat = getPageValueFormat({ context, pagination });
    return {
        prepareCall: getPrepareCall({
            context,
            pagination,
            signature,
            pageType,
            pageRequestType,
            pagePropertyFormat,
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
            requestPagePropertyFormat
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
    endpoint,
    errorDecoder
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
    signature: EndpointSignatureInfo;
    pageType: go.Type;
    pageRequestType: go.Type;
    pagePropertyFormat: go.AstNode;
    endpoint: HttpEndpoint;
    errorDecoder: go.CodeBlock | undefined;
}): go.AstNode {
    const pagePropertySetter = getPagePropertySetter({ pagination, pageType, pagePropertyFormat });
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
                            request: signature.request?.getRequestReference(),
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
    requestPagePropertyFormat
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
    signature: EndpointSignatureInfo;
    pageType: go.Type;
    nextPageType: go.Type | undefined;
    requestPagePropertyReference: go.AstNode;
    requestPagePropertyFormat: go.AstNode;
}): go.AstNode {
    const initializer = getPagePropertyInitializer({
        pagination,
        pageType,
        requestPagePropertyReference,
        requestPagePropertyFormat
    });
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
                        type: signature.returnType ?? go.Type.any()
                    })
                ],
                return_: [
                    getPageResponseType({
                        context,
                        pagination,
                        pageType
                    })
                ],
                body: getReadPageResponseBody({
                    context,
                    pagination,
                    pageType,
                    nextPageType
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
    pagination: Pagination;
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
    pagination: Pagination;
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
    pagination: Pagination;
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
    pagination: Pagination;
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
            return go.TypeInstantiation.nop();
        default:
            assertNever(pagination);
    }
}

function getReadPageResponseBody({
    context,
    pagination,
    pageType,
    nextPageType
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
    pageType: go.Type;
    nextPageType: go.Type | undefined;
}): go.AstNode {
    switch (pagination.type) {
        case "cursor":
            return getReadPageResponseBodyForCursor({
                context,
                pagination,
                cursor: pagination,
                pageType,
                nextPageType
            });
        case "offset":
            return getReadPageResponseBodyForOffset({
                context,
                pagination,
                pageType
            });
        case "custom":
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
    nextPageType
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
    cursor: CursorPagination;
    pageType: go.Type;
    nextPageType: go.Type | undefined;
}): go.AstNode {
    return go.codeblock((writer) => {
        writer.write("var zeroValue ");
        writer.writeNode(nextPageType ?? pageType);
        writer.newLine();
        writer.writeNode(getNextCursorSetter({ context, page: cursor.page, cursor: cursor.next }));
        writer.writeNode(getNextResultsSetter({ context, results: pagination.results }));
        writer.write("return ");
        writer.writeNode(
            go.TypeInstantiation.structPointer({
                typeReference: getPageResponseTypeReference({ context, pagination, pageType }),
                fields: [
                    {
                        name: "Next",
                        value: getNextReference({ pageType, nextPageType })
                    },
                    {
                        name: "Results",
                        value: go.TypeInstantiation.reference(go.codeblock("results"))
                    },
                    {
                        name: "Done",
                        value: go.TypeInstantiation.reference(go.codeblock("next == zeroValue"))
                    }
                ]
            })
        );
    });
}

function getReadPageResponseBodyForOffset({
    context,
    pagination,
    pageType
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
    pageType: go.Type;
}): go.AstNode {
    return go.codeblock((writer) => {
        writer.writeLine("next += 1");
        writer.writeNode(getNextResultsSetter({ context, results: pagination.results }));
        writer.write("return ");
        writer.writeNode(
            go.TypeInstantiation.structPointer({
                typeReference: getPageResponseTypeReference({ context, pagination, pageType }),
                fields: [
                    {
                        name: "Next",
                        value: go.TypeInstantiation.reference(go.codeblock(pageType.isOptional() ? "&next" : "next"))
                    },
                    {
                        name: "Results",
                        value: go.TypeInstantiation.reference(go.codeblock("results"))
                    }
                ]
            })
        );
    });
}

function getNextCursorSetter({
    context,
    page,
    cursor
}: {
    context: SdkGeneratorContext;
    page: RequestProperty;
    cursor: ResponseProperty;
}): go.AstNode {
    return getResponsePropertySetter({
        context,
        responseProperty: cursor,
        variableName: "next",
        dereference: page.property.valueType.type !== cursor.property.valueType.type
    });
}

function getNextResultsSetter({
    context,
    results
}: {
    context: SdkGeneratorContext;
    results: ResponseProperty;
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
    responseProperty: ResponseProperty;
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
                    propertyPath: responsePropertyPath.map((item) => item.name)
                })
            );
            writer.writeLine(" {");
            writer.indent();
            writer.write(`${variableName} = `);
            writer.writeNode(
                getPropertyReference({
                    variableName: "response",
                    propertyPath: responsePropertyPath.map((item) => item.name),
                    name: responseProperty.property.name.name,
                    dereference
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
                withGetter: context.customConfig.gettersPassByValue !== true
            })
        );
        writer.newLine();
    });
}

function getPagePropertySetter({
    pagination,
    pageType,
    pagePropertyFormat
}: {
    pagination: Pagination;
    pageType: go.Type;
    pagePropertyFormat: go.AstNode;
}): go.AstNode {
    switch (pagination.type) {
        case "cursor":
        case "offset":
            return go.codeblock((writer) => {
                if (pageType.isOptional()) {
                    writer.writeLine(`if ${PAGE_REQUEST_CURSOR_NAME} != nil {`);
                    writer.indent();
                    writer.writeNode(
                        setQueryParameter({
                            key: pagination.page.property.name.wireValue,
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
                        key: pagination.page.property.name.wireValue,
                        value: pagePropertyFormat
                    })
                );
                writer.newLine();
            });
        case "custom":
            return go.TypeInstantiation.nop();
        default:
            assertNever(pagination);
    }
}

function getPagePropertyInitializer({
    pagination,
    pageType,
    requestPagePropertyReference,
    requestPagePropertyFormat
}: {
    pagination: Pagination;
    pageType: go.Type;
    requestPagePropertyReference: go.AstNode;
    requestPagePropertyFormat: go.AstNode;
}): go.AstNode | undefined {
    switch (pagination.type) {
        case "offset": {
            return go.codeblock((writer) => {
                if (pageType.isOptional()) {
                    writer.writeNode(getOffsetInitializer({ pageType }));
                    writer.newLine();
                    writer.write("if ");
                    writer.writeNode(
                        hasQueryParameter({
                            key: pagination.page.property.name.wireValue
                        })
                    );
                    writer.writeLine(" {");
                    writer.indent();
                    writer.writeNode(
                        getPageValueParser({
                            pageType,
                            valueVariable: "next",
                            queryParameterValue: getQueryParameter({ key: pagination.page.property.name.wireValue })
                        })
                    );
                    writer.dedent();
                    writer.writeLine("}");
                    return;
                }
                writer.writeNode(requestPagePropertyReference);
                writer.write(" := ");
                writer.writeNode(requestPagePropertyFormat);
                writer.newLine();
            });
        }
        case "cursor":
        case "custom":
            return undefined;
        default:
            assertNever(pagination);
    }
}

function getOffsetInitializer({ pageType }: { pageType: go.Type }): go.AstNode {
    const underlying = pageType.underlying();
    switch (underlying.internalType.type) {
        case "string":
            return go.codeblock('var next string = "1"');
        case "uuid":
            return go.codeblock("var next uuid.UUID");
        case "int":
            return go.codeblock("next := 1");
        case "int64":
            return go.codeblock("var next int64 = 1");
        case "float64":
            return go.codeblock("var next float64 = 1");
        default:
            return go.codeblock("next := 1");
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
    pagination: Pagination;
}): go.Type {
    switch (pagination.type) {
        case "cursor":
        case "offset":
            return context.goTypeMapper.convert({ reference: pagination.page.property.valueType });
        case "custom":
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
    pagination: Pagination;
}): go.Type | undefined {
    switch (pagination.type) {
        case "cursor":
            return context.goTypeMapper.convert({ reference: pagination.next.property.valueType });
        case "offset": {
            return context.goTypeMapper.convert({ reference: pagination.page.property.valueType });
        }
        case "custom":
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
    pageType
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
    pageType: go.Type;
}): go.Type {
    return go.Type.pointer(go.Type.reference(getPageResponseTypeReference({ context, pagination, pageType })));
}

function getPageResponseTypeReference({
    context,
    pagination,
    pageType
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
    pageType: go.Type;
}): go.TypeReference {
    return go.typeReference({
        name: "PageResponse",
        importPath: context.getCoreImportPath(),
        generics: [pageType, getResponseElementType({ context, pagination })]
    });
}

function getPageValueFormat({
    context,
    pagination
}: {
    context: SdkGeneratorContext;
    pagination: Pagination;
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
    pagination: Pagination;
}): go.Type {
    const converted = context.goTypeMapper.convert({ reference: pagination.results.property.valueType });
    const iterableElement = converted.underlying().iterableElement();
    if (iterableElement != null) {
        return iterableElement;
    }
    return converted;
}

function getPagePropertyReference({
    variableName,
    pagination,
    withGetter
}: {
    variableName: string;
    pagination: Pagination;
    withGetter?: boolean;
}): go.AstNode {
    switch (pagination.type) {
        case "cursor":
        case "offset": {
            return getPropertyReference({
                variableName,
                propertyPath: pagination.page.propertyPath?.map((item) => item.name),
                name: pagination.page.property.name.name,
                withGetter
            });
        }
        case "custom":
            return go.TypeInstantiation.nop();
        default:
            assertNever(pagination);
    }
}

function getResponsePropertyReference({
    results,
    withGetter
}: {
    results: ResponseProperty;
    withGetter?: boolean;
}): go.AstNode {
    return getPropertyReference({
        variableName: "response",
        propertyPath: results.propertyPath?.map((item) => item.name),
        name: results.property.name.name,
        withGetter
    });
}

function getPropertyReference({
    variableName,
    propertyPath,
    name,
    withGetter,
    dereference
}: {
    variableName: string;
    propertyPath: Name[] | undefined;
    name: Name;
    withGetter?: boolean;
    dereference?: boolean;
}): go.AstNode {
    const fullPath = [...(propertyPath ?? []), name];
    return go.codeblock((writer) => {
        if (dereference) {
            writer.write("*");
        }
        writer.write(`${variableName}.${fullPath.map((name) => getPropertyAccessor({ name, withGetter })).join(".")}`);
    });
}

function getPropertyNilCheckCondition({
    variableName,
    propertyPath
}: {
    variableName: string;
    propertyPath: Name[];
}): go.AstNode {
    const checks = propertyPath.map((_, index) => {
        const pathSegment = propertyPath
            .slice(0, index + 1)
            .map((name) => getPropertyAccessor({ name }))
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

function getPropertyAccessor({ name, withGetter }: { name: Name; withGetter?: boolean }): string {
    if (withGetter) {
        return `Get${name.pascalCase.unsafeName}()`;
    }
    return name.pascalCase.unsafeName;
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
