import { Fetcher } from "./Fetcher";

export class DefaultFetcher implements Fetcher {
    public fetch = async (args: Fetcher.Args): Promise<Fetcher.Response> => {
        const fetchResponse = await fetch(args.url, {
            method: args.method,
            headers: args.headers,
        });

        return {
            text: await fetchResponse.text(),
            statusCode: fetchResponse.status,
        };
    };
}
