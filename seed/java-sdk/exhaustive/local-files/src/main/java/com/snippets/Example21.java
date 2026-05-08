package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithRequiredField;
import java.util.HashMap;

public class Example21 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnMapOfPrimToObject(
            new HashMap<String, TypesObjectWithRequiredField>() {{
                put("key", TypesObjectWithRequiredField
                    .builder()
                    .string("string")
                    .build());
            }}
        );
    }
}