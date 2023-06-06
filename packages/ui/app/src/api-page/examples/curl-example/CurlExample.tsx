import { noop } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React, { useCallback, useMemo } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { assertVoidNoThrow } from "../../../utils/assertVoidNoThrow";
import { getEndpointEnvironmentUrl } from "../../endpoints/getEndpointEnvironmentUrl";
import { JsonExampleContext, JsonExampleContextValue } from "../json-example/contexts/JsonExampleContext";
import { JsonPropertyPath } from "../json-example/contexts/JsonPropertyPath";
import { JsonExampleString } from "../json-example/JsonExampleString";
import { JsonItemBottomLine } from "../json-example/JsonItemBottomLine";
import { JsonItemMiddleLines } from "../json-example/JsonItemMiddleLines";
import { JsonItemTopLine } from "../json-example/JsonItemTopLine";
import { CurlExampleLine } from "./CurlExampleLine";
import { CurlExamplePart } from "./CurlExamplePart";
import { CurlParameter } from "./CurlParameter";

export declare namespace CurlExample {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        example: FernRegistryApiRead.ExampleEndpointCall;
        selectedProperty: JsonPropertyPath | undefined;
        parent: HTMLElement | undefined;
    }
}

const CURL_PREFIX = "curl ";

export const CurlExample: React.FC<CurlExample.Props> = ({ endpoint, example, selectedProperty, parent }) => {
    const { apiDefinition } = useApiDefinitionContext();

    const contextValue = useCallback(
        (): JsonExampleContextValue => ({
            selectedProperty,
            containerRef: parent,
        }),
        [parent, selectedProperty]
    );

    const environmentUrl = useMemo(() => getEndpointEnvironmentUrl(endpoint) ?? "localhost:8000", [endpoint]);

    const parts = useMemo(() => {
        const lines: CurlExamplePart[] = [];

        if (endpoint.method !== FernRegistryApiRead.HttpMethod.Get) {
            lines.push({
                value: <CurlParameter paramKey="--method" value={endpoint.method.toUpperCase()} />,
            });
        }

        lines.push({
            value: <CurlParameter paramKey="--url" value={`${environmentUrl}${example.path}`} />,
        });

        for (const queryParam of endpoint.queryParameters) {
            const value = example.queryParameters[queryParam.key];
            if (value != null) {
                lines.push({
                    value: <CurlParameter paramKey="--url-query" value={`${queryParam.key}=${value}`} />,
                });
            }
        }

        if (apiDefinition.auth != null && endpoint.authed) {
            apiDefinition.auth._visit({
                basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
                    lines.push({
                        value: <CurlParameter paramKey="--user" value={`${usernameName}:${passwordName}`} />,
                    });
                },
                bearerAuth: ({ tokenName = "token" }) => {
                    lines.push({
                        value: <CurlParameter paramKey="--header" value={`Authorization <${tokenName}>`} />,
                    });
                },
                header: ({ headerWireValue, nameOverride = headerWireValue }) => {
                    lines.push({
                        value: <CurlParameter paramKey="--header" value={`${headerWireValue}: <${nameOverride}>`} />,
                    });
                },
                _other: noop,
            });
        }

        for (const header of endpoint.headers) {
            const value = example.headers[header.key];
            if (value != null) {
                lines.push({
                    value: <CurlParameter paramKey="--header" value={`${header.key}: ${value}`} />,
                });
            }
        }

        if (endpoint.request != null) {
            switch (endpoint.request.type.type) {
                case "fileUpload":
                    lines.push({
                        value: <CurlParameter paramKey="--data" value="@file" />,
                    });
                    break;
                case "object":
                case "reference":
                    lines.push(
                        {
                            value: (
                                <>
                                    <CurlParameter paramKey="--data" /> <JsonExampleString value="'" doNotAddQuotes />
                                </>
                            ),
                            excludeTrailingBackslash: true,
                        },
                        {
                            value: (
                                <>
                                    <JsonItemTopLine value={example.requestBody} isNonLastItemInCollection={false} />
                                    <JsonItemMiddleLines value={example.requestBody} />
                                    <JsonItemBottomLine value={example.requestBody} isNonLastItemInCollection={false} />
                                </>
                            ),
                            excludeIndent: true,
                            excludeTrailingBackslash: true,
                        },
                        {
                            value: <JsonExampleString value="'" doNotAddQuotes />,
                            excludeIndent: true,
                        }
                    );
                    break;
                default:
                    assertVoidNoThrow(endpoint.request.type.type);
            }
        }

        const curlElement = <span className="text-yellow-100">{CURL_PREFIX}</span>;
        if (lines[0] != null) {
            lines[0] = {
                ...lines[0],
                value: (
                    <>
                        {curlElement}
                        {lines[0].value}
                    </>
                ),
            };
        } else {
            lines.unshift({
                value: curlElement,
            });
        }

        return lines;
    }, [
        apiDefinition.auth,
        endpoint.authed,
        endpoint.headers,
        endpoint.method,
        endpoint.queryParameters,
        endpoint.request,
        environmentUrl,
        example.headers,
        example.path,
        example.queryParameters,
        example.requestBody,
    ]);

    return (
        <JsonExampleContext.Provider value={contextValue}>
            {parts.map((part, index) => (
                <CurlExampleLine
                    key={index}
                    part={part}
                    indent={index > 0 ? CURL_PREFIX.length : 0}
                    isLastPart={index === parts.length - 1}
                />
            ))}
        </JsonExampleContext.Provider>
    );
};
