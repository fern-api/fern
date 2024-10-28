import { HttpMethodSchema } from "../schemas";

export declare namespace HttpEndpointReferenceParser {
    interface Parsed {
        path: string;
        method: HttpMethodSchema;
    }

    export type ValidationResult = Valid | Invalid;

    interface Valid {
        type: "valid";
    }

    interface Invalid {
        type: "invalid";
    }
}

/**
 * Parses an HTTP endpoint reference like `POST /users/get`
 */
export class HttpEndpointReferenceParser {
    //eslint-disable-next-line
    private REFERENCE_REGEX = /^(GET|POST|PUT|DELETE|PATCH)\s(\/[a-zA-Z0-9\/]*)$/;

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
        if (match == null || match[1] == null || match[2] == null) {
            return undefined;
        }
        return {
            method: match[1] as HttpMethodSchema,
            path: match[2]
        };
    }
}
