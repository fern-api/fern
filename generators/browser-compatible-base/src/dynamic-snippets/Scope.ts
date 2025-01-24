export const Scope = {
    PathParameters: "pathParameters",
    QueryParameters: "queryParameters",
    Headers: "headers",
    RequestBody: "requestBody"
} as const;

export type Scope = (typeof Scope)[keyof typeof Scope];
