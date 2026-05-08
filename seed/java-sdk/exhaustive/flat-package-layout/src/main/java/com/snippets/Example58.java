package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TypesDocumentedUnknownType;
import java.util.HashMap;

public class Example58 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().object().getAndReturnMapOfDocumentedUnknownType(new HashMap<String, Object>() {
            {
                put("string", TypesDocumentedUnknownType.of(new HashMap<String, Object>() {
                    {
                        put("key", "value");
                    }
                }));
            }
        });
    }
}
