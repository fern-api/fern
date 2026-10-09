package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.products.requests.GetProductsRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.products()
                .get("regionId", "productId", GetProductsRequest.builder().build());
    }
}
