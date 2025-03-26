import { TaskContext } from "@fern-api/task-context";

import type { Result } from "../types/result.js";
import { fetchPageHtml } from "../utils/network.js";
import { parsePage } from "./parsePage.js";

export function* chunkIterator<T>(array: T[], size = 16): Generator<T[]> {
    let position = 0;
    while (position < array.length) {
        const segment = array.slice(position, position + size);
        yield segment;
        position += size;
    }
}

export async function parsePageGroup(
    taskContext: TaskContext,
    navGroup: Array<URL>,
    opts: {
        externalLinks: boolean;
        rootPaths?: Array<string>;
    } = { externalLinks: false }
): Promise<Array<Result<[string, string]>>> {
    const allResults: Array<Result<[string, string]>> = [];
    for (const chunk of chunkIterator(navGroup)) {
        const result = await Promise.all(
            chunk.map(async (url, index) => {
                try {
                    if (opts.externalLinks) {
                        taskContext.logger.debug(`Scraping external link with URL: ${url}...`);
                        return parsePage(taskContext, `external-link-${index}`, url, { externalLink: true });
                    } else {
                        const html = await fetchPageHtml({ url });
                        taskContext.logger.debug(`Scraping internal link with URL: ${url}...`);
                        return parsePage(taskContext, html, url, {
                            externalLink: false,
                            rootPath: opts.rootPaths ? opts.rootPaths[index] : undefined
                        });
                    }
                } catch (error) {
                    return { success: false, data: undefined };
                }
            })
        );
        allResults.push(...result);
    }
    return allResults;
}
