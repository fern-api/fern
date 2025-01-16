import type { Result } from "../types/result.js";
import { fetchPageHtml } from "../utils/network";
import { parsePage } from "./parsePage";

export function* intoChunks<T>(values: T[], chunkSize = 16) {
    for (let i = 0; i < values.length; i += chunkSize) {
        const chunk = values.slice(i, i + chunkSize);
        yield chunk;
    }
}

export async function parsePageGroup(
    navGroup: Array<URL>,
    opts: {
        externalLinks: boolean;
        rootPaths?: Array<string>;
    } = { externalLinks: false }
): Promise<Array<Result<[string, string]>>> {
    const allResults: Array<Result<[string, string]>> = [];
    for (const chunk of intoChunks(navGroup)) {
        const res = await Promise.all(
            chunk.map(async (url, index) => {
                try {
                    if (opts.externalLinks) {
                        const res = parsePage(`external-link-${index}`, url, { externalLink: true });
                        return res;
                    }

                    if (url.toString().endsWith("/overview")) {
                        url = new URL(url.toString().replace("/overview", ""));
                    }

                    const html = await fetchPageHtml({ url });
                    const res = parsePage(html, url, {
                        externalLink: false,
                        rootPath: opts.rootPaths ? opts.rootPaths[index] : undefined
                    });
                    return res;
                } catch (error) {
                    return {
                        success: false,
                        data: undefined
                    };
                }
            })
        );
        allResults.push(...res);
    }
    return allResults;
}
