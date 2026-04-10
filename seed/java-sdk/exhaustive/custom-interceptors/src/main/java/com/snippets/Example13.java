package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TypesMixedType;
import java.util.HashMap;

public class Example13 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsContainer()
                .endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(new HashMap<String, TypesMixedType>() {
                    {
                        put("string", TypesMixedType.of(1.1));
                    }
                });
    }
}
