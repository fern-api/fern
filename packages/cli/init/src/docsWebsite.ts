import axios, { AxiosResponse } from "axios";
import { load } from "cheerio";
import { Logger } from "../../logger/src/Logger";
import { FernReadme } from "@fern-fern/readme";
import { merge } from "lodash-es";
import { ReadmeApiReferenceEndpointResponse } from "@fern-fern/readme/api";

export type DocsWebsite = ReadMeDocsWebsite | GenericDocsWebsite;

export type Endpoint = string;
export type ApiSection = string;

// export interface ColorConfig {
//     primaryColor: string;
//     backgroundColor: string;
// }

//todo add interface for readme color cfg
export interface DocsWebsiteInterface {
    getAllOpenApiUrls(): Promise<string[]>;
    getBaseUrl(): string;
    isUrlValid(): boolean;
    isApiReferencePage(url: string): Promise<boolean>;
    getOpenApiFromApiReferencePages(): Promise<Record<string, unknown> | null>;
    // getColorConfig(): ColorConfig;
}

type GetReadMeApiStatus = ReadmeApiReferenceEndpointResponseSuccess | ReadmeApiReferenceEndpointResponseError;
interface ReadmeApiReferenceEndpointResponseSuccess {
    type: "success"
    response: FernReadme.ReadmeApiReferenceEndpointResponse;
    endpoint: Endpoint;

}

interface ReadmeApiReferenceEndpointResponseError {
    type: "error"
    errorMsg: string;

}

interface ApiResponseWithSection {
    response: FernReadme.ReadmeApiReferenceEndpointResponse;
    section: ApiSection;
}

class GenericDocsWebsite implements DocsWebsiteInterface {
    url: string;
    logger: Logger;

    constructor(url: string, logger: Logger) {
        this.url = url;
        this.logger = logger;
    }

    async getAllOpenApiUrls(): Promise<string[]> {
        throw new Error("Method not implemented.");
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

    async isApiReferencePage(_url: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async getOpenApiFromApiReferencePages(): Promise<Record<string, unknown> | null> {
        throw new Error("Method not implemented.");
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

    private async getGroupingStructure(): Promise<Map<Endpoint, ApiSection>> {
        try {
            const response = await axios.get(this.url);

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
                                    const pageLink = new URL(link, this.url).toString();
                                    apiTagMap.set(pageLink, apiSectionName);
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

    private async tryGetRequestUntilJsonResponseOrTimeout(
        url: string,
        timeoutSeconds: number
    ): Promise<AxiosResponse | null> {
        const startTime = Date.now();
        let response: AxiosResponse;
        do {
            response = await axios.get(url, {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            if (
                response.status === 200 &&
                Object.hasOwn(response.headers, "content-type") &&
                response.headers["content-type"] != null &&
                response.headers["content-type"].includes("application/json")
            ) {
                return response;
            }
        } while (Date.now() - startTime < timeoutSeconds * 1000);

        return null;
    }

    private async getReadMeApiFromOnePage(_url: string): Promise<GetReadMeApiStatus> {
        try {
            const url = new URL(_url);
            url.searchParams.set("json", "on");
            this.logger.debug(`Fetching api reference page from ${url}`);
            const response = await this.tryGetRequestUntilJsonResponseOrTimeout(url.toString(), 5);

            if (response == null) {
                const errorMsg = `Failed to fetch api reference page from ${url}, timed out after 5 seconds.`;
                this.logger.debug(errorMsg);
                return {
                    type: "error",
                    errorMsg,
                };
            }

            if (response.status !== 200) {
                const errorMsg = `Failed to fetch api reference page from ${url}, got error code ${response.status}. Please ensure the page contains a reference to an api endpoint!`;
                this.logger.debug(errorMsg);
                return {
                    type: "error",
                    errorMsg
                };
            }
            this.logger.debug(`Successfully fetched api reference page from ${url}, got response ${response.status}.`);
            // this.logger.debug(`Response data: ${JSON.stringify(response.data)}`);
            const rdmePage: ReadmeApiReferenceEndpointResponse = JSON.parse(JSON.stringify(response.data));
            // this.logger.debug(`Response data readme page: ${JSON.stringify(rdmePage)}`);
            return {
                type: "success",
                response: rdmePage,
                endpoint: _url,
            };
        } catch (error) {
            const errorMsg = `Failed to fetch api reference page from ${_url}, got error ${error}`;
            this.logger.error(errorMsg);
            return {
                type: "error",
                errorMsg,
            };
        }
    }

    private async getAllReadMeApiResponses(): Promise<(ApiResponseWithSection | null)[]> {
        const endpointGrouping = await this.getGroupingStructure();
        const promises = [];
        for (const [endpoint, apiSectionName] of endpointGrouping) {
            this.logger.debug(`Endpoint: ${endpoint}, ApiSection: ${apiSectionName}`);
            promises.push(async function(dw: ReadMeDocsWebsite, section: string) {
                const response = await dw.getReadMeApiFromOnePage(endpoint);
                if (response.type === "error") {
                    return null;
                }
                return {
                    response: response.response,
                    section,
                };
            
            }(this, apiSectionName));
        }

        const resps = await Promise.all(promises);
        return resps;
    }

    async isApiReferencePage(url: string): Promise<boolean> {
        try {
            const readmeApiResponseResult = await this.getReadMeApiFromOnePage(url);
            if (readmeApiResponseResult.type === "error") {
                return false;
            }
            
            return readmeApiResponseResult.response.doc.isApi;
        } catch (error) {
            this.logger.error(`Failed to fetch api reference page from ${url}, got error ${error}`);
            return false;
        }
    }

    async getOpenApiFromApiReferencePages(): Promise<Record<string, unknown> | null> {
        const rdmeRespsWithSection = await this.getAllReadMeApiResponses();

        const openApiObj = {};
        for (const responseWithSection of rdmeRespsWithSection) {
            if (responseWithSection == null) {
                continue;
            }
            this.logger.debug(`Got section ${responseWithSection.section}`);
            const oasDef = responseWithSection.response.oasDefinition;
            if (oasDef == null) {
                this.logger.debug(`No openapi object found for ${responseWithSection.section}`);
                continue;
            }
            
            if (typeof oasDef === "object" && oasDef.paths != null) {
                for (const [_path, pathObj] of Object.entries(oasDef.paths)) {
                    if (pathObj == null || typeof pathObj !== "object")  {
                        continue;
                    }
                    for (const [_method, methodObj] of Object.entries(pathObj)) {
                        if (methodObj == null) {
                            continue;
                        }
                        let sectionNameToAdd = responseWithSection.section;
                        if (methodObj.operationId.toLowerCase() === responseWithSection.section.toLowerCase()) {
                            sectionNameToAdd = `${responseWithSection.section} Section`;
                        }
                        if (methodObj.tags != null && Array.isArray(methodObj.tags) && methodObj.tags.length > 0) {
                            const tagName = methodObj.tags[0];
                            this.logger.debug(`Tag name exists: ${tagName}`);
                            continue;
                        }
                        this.logger.debug(`Adding tag ${sectionNameToAdd}`);
                        methodObj.tags = [sectionNameToAdd];
                    }
                }
            }

            responseWithSection.response.oasDefinition != null && merge(openApiObj, oasDef);
        }
        
        if (Object.keys(openApiObj).length === 0) {
            this.logger.debug("Failed to merge openapi documents, no valid documents found");
            return null;
        }
        return openApiObj;
    }
}