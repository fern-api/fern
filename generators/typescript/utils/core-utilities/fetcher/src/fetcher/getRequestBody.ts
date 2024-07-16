export declare namespace GetRequestBody {
    interface Args {
        body: unknown;
        type: string;
    }
}

export async function getRequestBody({ body, type }: GetRequestBody.Args): Promise<BodyInit | undefined> {
    if (type.includes("json")) {
        return JSON.stringify(body);
    } else {
        return body as BodyInit;
    }
}
