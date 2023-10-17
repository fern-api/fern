import axios from "axios";
import { load } from "cheerio";
import { Logger } from "../../logger/src/Logger";

export type DocsWebsite = ReadMeDocsWebsite | GenericDocsWebsite;

export interface DocsWebsiteInterface {
    getAllOpenApiUrls(): Promise<string[]>;
    getBaseUrl(): string;
    isUrlValid(): boolean;
}

class GenericDocsWebsite implements DocsWebsiteInterface {
    url: string;
    logger: Logger;

    constructor(url: string, logger: Logger) {
        this.url = url;
        this.logger = logger;
    }

    async getAllOpenApiUrls(): Promise<string[]> {
        return [];
    }

    getBaseUrl(): string {
        const url = new URL(this.url);
        return url.origin;
    }

    isUrlValid(): boolean {
        if (!this.url || this.url === "") {
            return false;
        }

        try {
            new URL(this.url);
            return true;
        } catch (err) {
            return false;
        }
    }
}

export class ReadMeDocsWebsite extends GenericDocsWebsite {
    public readonly type: "readme" = "readme";

    async getAllOpenApiUrls(): Promise<string[]> {
        try {
            const origin = new URL(this.getBaseUrl());
            const response = await axios.get(new URL("/openapi", origin).toString());

            if (response.status !== 200) {
                this.logger.error(`Failed to fetch openapi urls from ${this.url}, got error code ${response.status}`);
                return [];
            }
            const html = response.data;

            const $ = load(html);
            const openApiUrls: string[] = [];
            $("a").each((_index: number, element: cheerio.Element) => {
                const link = $(element).attr("href");
                if (link != null && link.includes("openapi")) {
                    openApiUrls.push(new URL(link, origin).toString());
                }
            });

            return openApiUrls;
        } catch (error) {
            return [];
        }
    }
}
