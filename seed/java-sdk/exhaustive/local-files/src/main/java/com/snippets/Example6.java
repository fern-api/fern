package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithRequiredField;
import java.util.Arrays;

public class Example6 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsContainer().endpointsContainerGetAndReturnSetOfObjects(
            Arrays.asList(
                TypesObjectWithRequiredField
                    .builder()
                    .string("string")
                    .build()
            )
        );
    }
}