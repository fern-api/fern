export declare namespace GetRequestBody {
    interface Args {
        body: unknown;

        type: "json" | "other";
    }
}

export async function getRequestBody({ body, type }: GetRequestBody.Args): Promise<BodyInit | undefined> {
    if (type === "json") {
        return JSON.stringify(body);
    } else {
        return body as BodyInit;
    }
}
