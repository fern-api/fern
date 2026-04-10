package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TypesDocumentedUnknownType;
import com.seed.api.types.TypesObjectWithDocumentedUnknownType;
import java.util.HashMap;

public class Example45 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsObject()
                .endpointsObjectGetAndReturnWithDocumentedUnknownType(TypesObjectWithDocumentedUnknownType.builder()
                        .documentedUnknownType(TypesDocumentedUnknownType.of(new HashMap<String, Object>() {
                            {
                                put("key", "value");
                            }
                        }))
                        .build());
    }
}
