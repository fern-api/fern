package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.products.requests.SearchProductsRequest;
import com.seed.api.resources.products.types.SearchProductsRequestConfig;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.products()
                .search(
                        "regionId",
                        SearchProductsRequest.builder()
                                .query("query")
                                .config(SearchProductsRequestConfig.builder()
                                        .currency("currency")
                                        .limit(1)
                                        .build())
                                .build());
    }
}
