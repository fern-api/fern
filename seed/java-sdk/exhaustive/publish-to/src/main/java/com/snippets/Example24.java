package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.types.object.types.DocumentedUnknownType;
import com.seed.exhaustive.resources.types.object.types.ObjectWithDocumentedUnknownType;
import java.util.HashMap;

public class Example24 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .object()
                .getAndReturnWithDocumentedUnknownType(ObjectWithDocumentedUnknownType.builder()
                        .documentedUnknownType(DocumentedUnknownType.of(new HashMap<String, Object>() {
                            {
                                put("key", "value");
                            }
                        }))
                        .build());
    }
}
