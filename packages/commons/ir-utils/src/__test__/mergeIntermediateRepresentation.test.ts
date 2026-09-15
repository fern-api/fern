import * as FernIr from "@fern-api/ir-sdk";

import { mergeIntermediateRepresentation } from "../mergeIntermediateRepresentation.js";
import { casingsGenerator, makeMinimalIr } from "./utils/makeMinimalIr.js";

function makeHeader(wireValue: string): FernIr.HttpHeader {
    return {
        name: {
            wireValue,
            name: casingsGenerator.generateName(wireValue)
        },
        valueType: FernIr.TypeReference.primitive({
            v1: "STRING",
            v2: FernIr.PrimitiveTypeV2.string({ default: undefined, validation: undefined })
        }),
        env: undefined,
        availability: undefined,
        docs: undefined,
        clientDefault: undefined,
        defaultValue: undefined,
        v2Examples: undefined
    };
}

function makeSingleBaseUrlConfig({
    id,
    url,
    baseUrlEnvVar
}: {
    id: string;
    url: string;
    baseUrlEnvVar?: string;
}): FernIr.EnvironmentsConfig {
    return {
        defaultEnvironment: id,
        baseUrlEnvVar,
        environments: FernIr.Environments.singleBaseUrl({
            environments: [
                {
                    id,
                    name: casingsGenerator.generateName(id),
                    url,
                    docs: undefined,
                    audiences: undefined,
                    defaultUrl: undefined,
                    urlTemplate: undefined,
                    urlVariables: undefined
                }
            ]
        })
    };
}

function makeMultipleBaseUrlsConfig({
    id,
    urls,
    baseUrlEnvVar
}: {
    id: string;
    urls: Record<string, string>;
    baseUrlEnvVar?: string;
}): FernIr.EnvironmentsConfig {
    return {
        defaultEnvironment: id,
        baseUrlEnvVar,
        environments: FernIr.Environments.multipleBaseUrls({
            baseUrls: Object.keys(urls).map((baseUrlId) => ({
                id: baseUrlId,
                name: casingsGenerator.generateName(baseUrlId)
            })),
            environments: [
                {
                    id,
                    name: casingsGenerator.generateName(id),
                    urls,
                    docs: undefined,
                    audiences: undefined,
                    defaultUrls: undefined,
                    urlTemplates: undefined,
                    urlVariables: undefined
                }
            ]
        })
    };
}

describe("mergeIntermediateRepresentation", () => {
    describe("header deduplication", () => {
        it("deduplicates global headers with the same wire value", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });
            const ir2 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(1);
            expect(merged.headers[0]?.name).toHaveProperty("wireValue", "custom_api_key");
        });

        it("deduplicates global headers case-insensitively", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("X-Api-Key")] });
            const ir2 = makeMinimalIr({ headers: [makeHeader("x-api-key")] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(1);
            expect(merged.headers[0]?.name).toHaveProperty("wireValue", "X-Api-Key");
        });

        it("keeps headers with different wire values", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("X-Api-Key")] });
            const ir2 = makeMinimalIr({ headers: [makeHeader("X-Request-Id")] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(2);
        });

        it("deduplicates across multiple specs with the same header", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });
            const ir2 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });
            const ir3 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });
            const ir4 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });

            let merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);
            merged = mergeIntermediateRepresentation(merged, ir3, casingsGenerator);
            merged = mergeIntermediateRepresentation(merged, ir4, casingsGenerator);

            expect(merged.headers).toHaveLength(1);
        });

        it("deduplicates idempotency headers by wire value", () => {
            const ir1 = makeMinimalIr({ idempotencyHeaders: [makeHeader("Idempotency-Key")] });
            const ir2 = makeMinimalIr({ idempotencyHeaders: [makeHeader("Idempotency-Key")] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.idempotencyHeaders).toHaveLength(1);
            expect(merged.idempotencyHeaders[0]?.name).toHaveProperty("wireValue", "Idempotency-Key");
        });

        it("handles empty headers gracefully", () => {
            const ir1 = makeMinimalIr({ headers: [] });
            const ir2 = makeMinimalIr({ headers: [] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(0);
        });

        it("handles one IR with headers and one without", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("X-Api-Key")] });
            const ir2 = makeMinimalIr({ headers: [] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(1);
        });
    });

    describe("baseUrlEnvVar", () => {
        it("carries baseUrlEnvVar through a single + single merge", () => {
            const ir1 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({
                    id: "Prod",
                    url: "https://prod.acme.com",
                    baseUrlEnvVar: "ACME_BASE_URL"
                })
            });
            const ir2 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({ id: "Other", url: "https://other.acme.com" })
            });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.environments?.baseUrlEnvVar).toBe("ACME_BASE_URL");
        });

        it("falls back to the second IR's baseUrlEnvVar when the first has none", () => {
            const ir1 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({ id: "Prod", url: "https://prod.acme.com" })
            });
            const ir2 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({
                    id: "Other",
                    url: "https://other.acme.com",
                    baseUrlEnvVar: "FROM_SECOND"
                })
            });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.environments?.baseUrlEnvVar).toBe("FROM_SECOND");
        });

        it("prefers the first IR's baseUrlEnvVar when both declare one", () => {
            const ir1 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({
                    id: "Prod",
                    url: "https://prod.acme.com",
                    baseUrlEnvVar: "FROM_FIRST"
                })
            });
            const ir2 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({
                    id: "Other",
                    url: "https://other.acme.com",
                    baseUrlEnvVar: "FROM_SECOND"
                })
            });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.environments?.baseUrlEnvVar).toBe("FROM_FIRST");
        });

        it("carries baseUrlEnvVar through a websocket single + single merge", () => {
            const ir1 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({
                    id: "Prod",
                    url: "wss://prod.acme.com",
                    baseUrlEnvVar: "ACME_BASE_URL"
                })
            });
            const ir2 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({ id: "Other", url: "wss://other.acme.com" })
            });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.environments?.environments.type).toBe("singleBaseUrl");
            expect(merged.environments?.baseUrlEnvVar).toBe("ACME_BASE_URL");
        });

        it("carries baseUrlEnvVar through a multi + single merge", () => {
            const ir1 = makeMinimalIr({
                environments: makeMultipleBaseUrlsConfig({
                    id: "Prod",
                    urls: { api: "https://api.acme.com" },
                    baseUrlEnvVar: "ACME_BASE_URL"
                })
            });
            const ir2 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({ id: "Other", url: "https://other.acme.com" })
            });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.environments?.environments.type).toBe("multipleBaseUrls");
            expect(merged.environments?.baseUrlEnvVar).toBe("ACME_BASE_URL");
        });

        it("carries baseUrlEnvVar through a multi + multi merge", () => {
            const ir1 = makeMinimalIr({
                environments: makeMultipleBaseUrlsConfig({
                    id: "Prod",
                    urls: { api: "https://api.acme.com" },
                    baseUrlEnvVar: "ACME_BASE_URL"
                })
            });
            const ir2 = makeMinimalIr({
                environments: makeMultipleBaseUrlsConfig({
                    id: "Other",
                    urls: { events: "https://events.acme.com" }
                })
            });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.environments?.environments.type).toBe("multipleBaseUrls");
            expect(merged.environments?.baseUrlEnvVar).toBe("ACME_BASE_URL");
        });

        it("leaves baseUrlEnvVar undefined when neither IR declares one", () => {
            const ir1 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({ id: "Prod", url: "https://prod.acme.com" })
            });
            const ir2 = makeMinimalIr({
                environments: makeSingleBaseUrlConfig({ id: "Other", url: "https://other.acme.com" })
            });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.environments?.baseUrlEnvVar).toBeUndefined();
        });
    });
});
