package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.products.requests.SearchProductsRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.products().search("regionId", SearchProductsRequest.builder().build());
    }
}
