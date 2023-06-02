import { noop } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React, { useCallback, useMemo } from "react";
import { JsonExampleContext, JsonExampleContextValue } from "../json-example/contexts/JsonExampleContext";
import { JsonPropertyPath } from "../json-example/contexts/JsonPropertyPath";
import { JsonItemBottomLine } from "../json-example/JsonItemBottomLine";
import { JsonItemMiddleLines } from "../json-example/JsonItemMiddleLines";
import { JsonItemTopLine } from "../json-example/JsonItemTopLine";
import { CurlExampleLines } from "./CurlExampleLines";
import { CurlExamplePart } from "./CurlExamplePart";

export declare namespace CurlExample {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        example: FernRegistryApiRead.ExampleEndpointCall;
        selectedProperty: JsonPropertyPath | undefined;
        parent: HTMLElement | undefined;
    }
}

export const CurlExample: React.FC<CurlExample.Props> = ({ endpoint, example, selectedProperty, parent }) => {
    const contextValue = useCallback(
        (): JsonExampleContextValue => ({
            selectedProperty,
            containerRef: parent,
        }),
        [parent, selectedProperty]
    );

    const parts = useMemo(() => {
        const parts: CurlExamplePart[] = [];

        if (endpoint.method !== FernRegistryApiRead.HttpMethod.Get) {
            parts.push({
                type: "stringLine",
                value: `--method ${endpoint.method.toUpperCase()}`,
            });
        }

        parts.push({
            type: "stringLine",
            value: `--url "localhost:8080${example.path}"`,
        });

        if (endpoint.request != null) {
            endpoint.request.type._visit({
                fileUpload: () => {
                    parts.push({
                        type: "stringLine",
                        value: "--data @file.txt",
                    });
                },
                object: () => {
                    parts.push({
                        type: "stringLine",
                        value: "--data '",
                        excludeTrailingBackslash: true,
                    });
                    parts.push({
                        type: "jsx",
                        value: (
                            <>
                                <JsonItemTopLine value={example.requestBody} isNonLastItemInCollection={false} />
                                <JsonItemMiddleLines value={example.requestBody} />
                                <JsonItemBottomLine value={example.requestBody} isNonLastItemInCollection={false} />
                            </>
                        ),
                    });
                    parts.push({
                        type: "stringLine",
                        value: "'",
                        excludeIndent: true,
                    });
                },
                reference: () => {
                    parts.push({
                        type: "stringLine",
                        value: "--data <TODO reference>",
                    });
                },
                _other: noop,
            });
        }

        return parts;
    }, [endpoint.method, endpoint.request, example.path, example.requestBody]);

    return (
        <JsonExampleContext.Provider value={contextValue}>
            <CurlExampleLines parts={parts} />
        </JsonExampleContext.Provider>
    );
};
