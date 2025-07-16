export declare namespace ParseEndpointLocator {
    type Result = FailedResult | SuccessResult;

    interface FailedResult {
        type: "failure";
        message: string;
    }

    interface SuccessResult {
        type: "success";
        method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
        path: string;
        pathParameters: Set<string>;
    }
}

/**
 * Parses an endpoint locator like `POST /users` or `GET /users/{userId}`
 * @param input a string containing the Http method and path (e.g. `GET /users/{userId}`)
 * @returns
 */
export function parseEndpointLocator(input: string): ParseEndpointLocator.Result {
    const [method, path] = input.split(" ");

    if (!method || !["POST", "GET", "PUT", "PATCH", "DELETE"].includes(method)) {
        return {
            type: "failure",
            message: `${input} contains invalid method ${method}`
        };
    }

    if (!path) {
        return {
            type: "failure",
            message: `${input} contains no path ${path}`
        };
    }

    const pathParameters = new Set<string>();
    const paramRegex = /{([^}]+)}/g;
    let match;

    while ((match = paramRegex.exec(path)) != null) {
        const maybePathParm = match[1];
        if (maybePathParm != null) {
            pathParameters.add(maybePathParm);
        }
    }

    return {
        type: "success",
        method: method as ParseEndpointLocator.SuccessResult["method"],
        path,
        pathParameters
    };
}
