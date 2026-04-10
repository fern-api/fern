package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesDocumentedUnknownType;
import java.util.HashMap;

public class Example47 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnMapOfDocumentedUnknownType(
            new HashMap<String, Object>() {{
                put("string", TypesDocumentedUnknownType.of(new 
                HashMap<String, Object>() {{put("key", "value");
                }}));
            }}
        );
    }
}