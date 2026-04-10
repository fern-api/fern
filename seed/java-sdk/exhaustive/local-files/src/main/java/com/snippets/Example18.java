package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithOptionalField;

public class Example18 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsContentType().endpointsContentTypePostJsonPatchContentWithCharsetType(
            TypesObjectWithOptionalField
                .builder()
                .build()
        );
    }
}