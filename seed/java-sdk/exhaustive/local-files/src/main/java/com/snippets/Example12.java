package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesMixedType;
import java.util.HashMap;

public class Example12 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsContainer().endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(
            new HashMap<String, TypesMixedType>() {{
                put("key", TypesMixedType.of(1.1));
            }}
        );
    }
}