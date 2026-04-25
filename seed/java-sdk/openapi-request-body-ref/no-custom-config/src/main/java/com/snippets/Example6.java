package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.catalog.requests.GetCatalogImageRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.catalog()
                .getCatalogImage("image_id", GetCatalogImageRequest.builder().build());
    }
}
