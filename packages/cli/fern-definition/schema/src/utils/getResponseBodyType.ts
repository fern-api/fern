import { HttpEndpointSchema } from "../schemas"

export function getResponseBodyType(endpoint: HttpEndpointSchema): string | undefined {
    if (endpoint.response == null) {
        return undefined
    }
    return typeof endpoint.response === "string" ? endpoint.response : endpoint.response.type
}
