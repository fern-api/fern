export declare namespace GetRequestBody {
    interface Args {
        body: unknown;
        type: "json" | "file" | "bytes" | "form" | "other";
    }
}
export declare function getRequestBody({ body, type }: GetRequestBody.Args): Promise<BodyInit | undefined>;
