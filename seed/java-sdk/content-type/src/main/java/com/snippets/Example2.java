package com.snippets;

import com.seed.contentTypes.SeedContentTypesClient;
import com.seed.contentTypes.resources.service.requests.RegularPatchRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedContentTypesClient client = SeedContentTypesClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().regularPatch(
            "id",
            RegularPatchRequest
                .builder()
                .field1("field1")
                .field2(1)
                .build()
        );
    }
}