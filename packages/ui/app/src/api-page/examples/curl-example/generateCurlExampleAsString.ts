import { noop } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { assertVoidNoThrow } from "../../../utils/assertVoidNoThrow";
import { getEndpointEnvironmentUrl } from "../../endpoints/getEndpointEnvironmentUrl";

interface StringCurlExampleLine {
    value: string;
    excludeTrailingBackslash?: boolean;
    excludeIndent?: boolean;
}

export function generateCurlExampleAsString({
    apiDefinition,
    endpoint,
    example,
}: {
    apiDefinition: FernRegistryApiRead.ApiDefinition;
    endpoint: FernRegistryApiRead.EndpointDefinition;
    example: FernRegistryApiRead.ExampleEndpointCall;
}): string {
    const linesExcludingCurlCommand: (string | StringCurlExampleLine)[] = [];

    if (endpoint.method !== FernRegistryApiRead.HttpMethod.Get) {
        linesExcludingCurlCommand.push({ value: `-X ${endpoint.method.toUpperCase()}` });
    }

    linesExcludingCurlCommand.push(`--url "${getEndpointEnvironmentUrl(endpoint)}${example.path}"`);

    for (const queryParam of endpoint.queryParameters) {
        const value = example.queryParameters[queryParam.key];
        if (value != null) {
            linesExcludingCurlCommand.push(`--url-query "${queryParam.key}=${value}"`);
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
        linesExcludingCurlCommand.push(`--header "Content-Type: ${requestContentType}"`);
    }

    if (apiDefinition.auth != null && endpoint.authed) {
        apiDefinition.auth._visit({
            basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
                linesExcludingCurlCommand.push(`--user "${usernameName}:${passwordName}"`);
            },
            bearerAuth: ({ tokenName = "token" }) => {
                linesExcludingCurlCommand.push(`--header "Authorization <${tokenName}>"`);
            },
            header: ({ headerWireValue, nameOverride = headerWireValue }) => {
                linesExcludingCurlCommand.push(`--header "${headerWireValue}: <${nameOverride}>"`);
            },
            _other: noop,
        });
    }

    for (const header of endpoint.headers) {
        const value = example.headers[header.key];
        if (value != null) {
            linesExcludingCurlCommand.push(`--header "${header.key}: ${value}"`);
        }
    }

    if (endpoint.request != null) {
        switch (endpoint.request.type.type) {
            case "fileUpload":
                linesExcludingCurlCommand.push("--data @file");
                break;
            case "object":
            case "reference":
                linesExcludingCurlCommand.push(
                    { value: "--data '", excludeTrailingBackslash: true },
                    ...JSON.stringify(example.requestBody, undefined, 2)
                        .split("\n")
                        .map(
                            (value): StringCurlExampleLine => ({
                                value,
                                excludeTrailingBackslash: true,
                                excludeIndent: true,
                            })
                        ),
                    { value: "'", excludeTrailingBackslash: true, excludeIndent: true }
                );
                break;
            default:
                assertVoidNoThrow(endpoint.request.type.type);
        }
    }

    return (
        "curl " +
        linesExcludingCurlCommand
            .map((line, index) => {
                const {
                    value,
                    excludeIndent = false,
                    excludeTrailingBackslash = false,
                } = typeof line === "string" ? { value: line } : line;

                const indent = index === 0 || excludeIndent ? 0 : "curl ".length;

                let s = `${" ".repeat(indent)}${value}`;
                if (index < linesExcludingCurlCommand.length - 1 && !excludeTrailingBackslash) {
                    s += " \\";
                }
                return s;
            })
            .join("\n")
    );
}
