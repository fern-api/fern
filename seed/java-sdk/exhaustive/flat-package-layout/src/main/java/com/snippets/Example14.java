package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TypesObjectWithRequiredField;

public class Example14 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsContainer()
                .endpointsContainerGetAndReturnOptional(
                        TypesObjectWithRequiredField.builder().string("string").build());
    }
}
