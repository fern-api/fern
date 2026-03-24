package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.DocumentedUnknownType;
import java.util.HashMap;

public class Example25 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnMapOfDocumentedUnknownType(
            new HashMap<String, Object>() {{
                put("string", DocumentedUnknownType.of(new 
                HashMap<String, Object>() {{put("key", "value");
                }}));
            }}
        );
    }
}