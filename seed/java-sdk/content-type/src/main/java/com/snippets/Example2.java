package com.snippets;

import com.seed.contentTypes.SeedContentTypesClient;
import com.seed.contentTypes.resources.service.requests.NamedMixedPatchRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedContentTypesClient client = SeedContentTypesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().namedPatchWithMixed(
            "id",
            NamedMixedPatchRequest
                .builder()
                .appId("appId")
                .instructions("instructions")
                .active(true)
                .build()
        );
    }
}