package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithRequiredField;
import java.util.HashMap;

public class Example10 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsContainer().endpointsContainerGetAndReturnMapOfPrimToObject(
            new HashMap<String, TypesObjectWithRequiredField>() {{
                put("key", TypesObjectWithRequiredField
                    .builder()
                    .string("string")
                    .build());
            }}
        );
    }
}