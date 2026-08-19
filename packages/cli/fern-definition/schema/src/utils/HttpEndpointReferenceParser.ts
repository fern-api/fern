export declare namespace HttpEndpointReferenceParser {
    interface Parsed {
        path: string;
        method: Method;
        namespace: string | undefined;
    }

    type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";

    export type ValidationResult = Valid | Invalid;

    interface Valid {
        type: "valid";
    }

    interface Invalid {
        type: "invalid";
    }
}

/**
 * Parses an HTTP endpoint reference like `POST /users/get` or `namespace::POST /users/get`
 */
export class HttpEndpointReferenceParser {
    //eslint-disable-next-line
    private REFERENCE_REGEX = /^(?:(\w+)::)?(GET|POST|PUT|DELETE|PATCH|HEAD)\s(\/\S*)$/;

    public validate(reference: string): HttpEndpointReferenceParser.ValidationResult {
        const validFormat = this.REFERENCE_REGEX.test(reference);
        if (!validFormat) {
            return { type: "invalid" };
        }
        return { type: "valid" };
    }

    public tryParse(reference: string): HttpEndpointReferenceParser.Parsed | undefined {
        const validationResponse = this.validate(reference);
        if (validationResponse.type === "invalid") {
            return undefined;
        }
        const match = reference.match(this.REFERENCE_REGEX);
        if (match == null || match[2] == null || match[3] == null) {
            return undefined;
        }
        return {
            namespace: match[1], // undefined if no namespace prefix
            method: match[2] as HttpEndpointReferenceParser.Method,
            path: match[3]
        };
    }
}
