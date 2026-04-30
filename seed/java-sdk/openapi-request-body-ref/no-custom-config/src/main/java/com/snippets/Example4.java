package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.catalog.requests.CreateCatalogImageBody;
import com.seed.api.types.CreateCatalogImageRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.catalog()
                .createCatalogImage(
                        null,
                        CreateCatalogImageBody.builder()
                                .request(CreateCatalogImageRequest.builder()
                                        .catalogObjectId("catalog_object_id")
                                        .build())
                                .build());
    }
}
