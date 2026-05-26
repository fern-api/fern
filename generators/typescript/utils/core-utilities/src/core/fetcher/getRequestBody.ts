import { toJson } from "../json";
import { toQueryString } from "../url/qs";

export declare namespace GetRequestBody {
    interface Args {
        body: unknown;
        type: "json" | "file" | "bytes" | "form" | "other";
        omitEmptyArrays?: boolean;
    }
}

export async function getRequestBody({ body, type, omitEmptyArrays }: GetRequestBody.Args): Promise<BodyInit | undefined> {
    if (type === "form") {
        return toQueryString(body, { arrayFormat: "repeat", encode: true });
    }
    if (type.includes("json")) {
        if (omitEmptyArrays) {
            return toJson(body, (_key, value) => {
                if (Array.isArray(value) && value.length === 0) {
                    return undefined;
                }
                return value;
            });
        }
        return toJson(body);
    } else {
        return body as BodyInit;
    }
}
