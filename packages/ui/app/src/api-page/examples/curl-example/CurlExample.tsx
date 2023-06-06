import { noop } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React, { useCallback, useMemo } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { useEndpointEnvironmentUrl } from "../../endpoints/useEndpointEnvironmentUrl";
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

    const environmentUrl = useEndpointEnvironmentUrl(endpoint) ?? "localhost:8080";

    const parts = useMemo(() => {
        const parts: CurlExamplePart[] = [];

        if (endpoint.method !== FernRegistryApiRead.HttpMethod.Get) {
            parts.push({
                value: <CurlParameter paramKey="-X" value={endpoint.method.toUpperCase()} />,
            });
        }

        parts.push({
            value: <CurlParameter paramKey="--url" value={`${environmentUrl}${example.path}`} />,
        });

        for (const queryParam of endpoint.queryParameters) {
            const value = example.queryParameters[queryParam.key];
            if (value != null) {
                parts.push({
                    value: <CurlParameter paramKey="--url-query" value={`${queryParam.key}=${value}`} />,
                });
            }
        }

        const requestContentType =
            endpoint.request != null
                ? endpoint.request.type._visit({
                      object: () => "application/json",
                      reference: () => "application/json",
                      fileUpload: () => "multipart/form-data",
                      _other: () => undefined,
                  })
                : undefined;
        if (requestContentType != null) {
            parts.push({
                value: <CurlParameter paramKey="--header" value={`Content-Type: ${requestContentType}`} />,
            });
        }

        if (apiDefinition.auth != null && endpoint.authed) {
            apiDefinition.auth._visit({
                basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
                    parts.push({
                        value: <CurlParameter paramKey="--user" value={`${usernameName}:${passwordName}`} />,
                    });
                },
                bearerAuth: ({ tokenName = "token" }) => {
                    parts.push({
                        value: <CurlParameter paramKey="--header" value={`Authorization <${tokenName}>`} />,
                    });
                },
                header: ({ headerWireValue, nameOverride = headerWireValue }) => {
                    parts.push({
                        value: <CurlParameter paramKey="--header" value={`${headerWireValue}: <${nameOverride}>`} />,
                    });
                },
                _other: noop,
            });
        }

        for (const header of endpoint.headers) {
            const value = example.headers[header.key];
            if (value != null) {
                parts.push({
                    value: <CurlParameter paramKey="--header" value={`${header.key}: ${value}`} />,
                });
            }
        }

        if (endpoint.request != null) {
            switch (endpoint.request.type.type) {
                case "fileUpload":
                    parts.push({
                        value: <CurlParameter paramKey="--data" value="@file" />,
                    });
                    break;
                case "object":
                case "reference":
                    parts.push(
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
        if (parts[0] != null) {
            parts[0] = {
                ...parts[0],
                value: (
                    <>
                        {curlElement}
                        {parts[0].value}
                    </>
                ),
            };
        } else {
            parts.unshift({
                value: curlElement,
            });
        }

        return parts;
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
                    indentInSpaces={index > 0 ? CURL_PREFIX.length : 0}
                    isLastPart={index === parts.length - 1}
                />
            ))}
        </JsonExampleContext.Provider>
    );
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertVoidNoThrow(_x: void): void {}
