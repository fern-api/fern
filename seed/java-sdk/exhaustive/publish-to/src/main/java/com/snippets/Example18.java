package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TypesObjectWithOptionalField;

public class Example18 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsContentType()
                .endpointsContentTypePostJsonPatchContentWithCharsetType(
                        TypesObjectWithOptionalField.builder().build());
    }
}
