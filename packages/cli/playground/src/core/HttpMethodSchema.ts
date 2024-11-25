export type HttpMethodSchema = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const HttpMethodSchema = {
    Get: "GET",
    Post: "POST",
    Put: "PUT",
    Patch: "PATCH",
    Delete: "DELETE"
} as const;
