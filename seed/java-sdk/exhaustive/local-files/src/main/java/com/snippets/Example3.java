package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithRequiredField;
import java.util.Arrays;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsContainer().endpointsContainerGetAndReturnListOfObjects(
            Arrays.asList(
                TypesObjectWithRequiredField
                    .builder()
                    .string("string")
                    .build(),
                TypesObjectWithRequiredField
                    .builder()
                    .string("string")
                    .build()
            )
        );
    }
}