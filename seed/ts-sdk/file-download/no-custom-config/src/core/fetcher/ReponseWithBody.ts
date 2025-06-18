
export type ReponseWithBody = Response & {
    body: ReadableStream<Uint8Array>;
};

export function isReponseWithBody(response: Response): response is ReponseWithBody {
    return (response as ReponseWithBody).body != null;
}