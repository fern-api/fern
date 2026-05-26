export declare namespace GetRequestBody {
    interface Args {
        body: unknown;
        type: "json" | "file" | "bytes" | "form" | "other";
        omitEmptyArrays?: boolean;
    }
}
export declare function getRequestBody({ body, type, omitEmptyArrays, }: GetRequestBody.Args): Promise<BodyInit | undefined>;
