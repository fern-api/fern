package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesDocumentedUnknownType;
import com.fern.sdk.types.TypesObjectWithDocumentedUnknownType;
import java.util.HashMap;

public class Example45 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnWithDocumentedUnknownType(
            TypesObjectWithDocumentedUnknownType
                .builder()
                .documentedUnknownType(
                    TypesDocumentedUnknownType.of(new 
                    HashMap<String, Object>() {{put("key", "value");
                    }})
                )
                .build()
        );
    }
}