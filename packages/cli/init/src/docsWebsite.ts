import axios from "axios";
import { load } from "cheerio";
import { Logger } from "../../logger/src/Logger";

export type DocsWebsite = ReadMeDocsWebsite | GenericDocsWebsite;

export type Endpoint = string;
export type ApiSection = string;
export interface DocsWebsiteInterface {
    getAllOpenApiUrls(): Promise<string[]>;
    getBaseUrl(): string;
    getGroupingStructure(): Promise<Map<Endpoint, ApiSection>>;
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

    async getGroupingStructure(): Promise<Map<Endpoint, ApiSection>> {
        return new Map<Endpoint, ApiSection>();
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

    async getGroupingStructure(): Promise<Map<Endpoint, ApiSection>> {
        try {
            const origin = new URL(this.getBaseUrl());
            const response = await axios.get(new URL("/reference", origin).toString());

            if (response.status !== 200) {
                this.logger.error(`Failed to fetch api grouping from ${this.url}, got error code ${response.status}`);
                return new Map<Endpoint, ApiSection>();
            }
            const html = response.data;

            const $ = load(html);
            const apiTagMap = new Map<Endpoint, ApiSection>();

            const sections = $("#Explorer").find("#reference-sidebar").find("section");

            sections.each((_index: number, sectionElem: cheerio.Element) => {
                $(sectionElem)
                    .find("div")
                    .each((_index: number, divElem: cheerio.Element) => {
                        const apiSectionName = $(divElem).find("h3").text();
                        $(divElem)
                            .find("a")
                            .each((_index: number, aElem: cheerio.Element) => {
                                const href = $(aElem).attr("href");
                                if (href != null) {
                                    const link: string = href.toString();
                                    if (link.includes("/reference")) {
                                        const linkRemoveRef = link.replace("/reference/", "");
                                        apiTagMap.set(linkRemoveRef, apiSectionName);
                                    }
                                }
                            });
                    });
            });

            return apiTagMap;
        } catch (error) {
            this.logger.error(`Failed to fetch api grouping from ${this.url}, got error ${error}`);
            return new Map<Endpoint, ApiSection>();
        }
    }
}
