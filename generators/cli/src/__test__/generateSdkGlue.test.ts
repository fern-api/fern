import { describe, expect, it } from "vitest";
import { parseClientStruct } from "../generateSdkGlue.js";

describe("parseClientStruct", () => {
    it("parses a simple client struct", () => {
        const source = `
pub struct CoinsClient {
    pub http_client: HttpClient,
    pub markets: MarketsClient,
    pub tickers: TickersClient,
}`;
        const result = parseClientStruct(source);
        expect(result).toEqual({
            name: "CoinsClient",
            hasHttpClient: true,
            fields: [
                { fieldName: "markets", typeName: "MarketsClient" },
                { fieldName: "tickers", typeName: "TickersClient" }
            ]
        });
    });

    it("parses a client struct with a numeric suffix (e.g. Client2)", () => {
        const source = `
pub struct ContractClient2 {
    pub http_client: HttpClient,
    pub market_chart: MarketChartClient4,
}`;
        const result = parseClientStruct(source);
        expect(result).toEqual({
            name: "ContractClient2",
            hasHttpClient: true,
            fields: [{ fieldName: "market_chart", typeName: "MarketChartClient4" }]
        });
    });

    it("parses a client struct with a larger numeric suffix", () => {
        const source = `
pub struct PoolsClient3 {
    pub http_client: HttpClient,
    pub megafilter: MegafilterClient,
    pub trending_search: TrendingSearchClient,
}`;
        const result = parseClientStruct(source);
        expect(result).toEqual({
            name: "PoolsClient3",
            hasHttpClient: true,
            fields: [
                { fieldName: "megafilter", typeName: "MegafilterClient" },
                { fieldName: "trending_search", typeName: "TrendingSearchClient" }
            ]
        });
    });

    it("filters out HttpClient and ClientConfig fields", () => {
        const source = `
pub struct SimpleClient2 {
    pub config: ClientConfig,
    pub http_client: HttpClient,
    pub price: PriceClient,
}`;
        const result = parseClientStruct(source);
        expect(result).toEqual({
            name: "SimpleClient2",
            hasHttpClient: true,
            fields: [{ fieldName: "price", typeName: "PriceClient" }]
        });
    });

    it("returns undefined when no client struct is found", () => {
        const source = `pub fn some_function() {}`;
        expect(parseClientStruct(source)).toBeUndefined();
    });
});
