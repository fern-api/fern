package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesDocumentedUnknownType;
import com.fern.sdk.types.TypesObjectWithDocumentedUnknownType;
import java.util.HashMap;

public class Example56 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithDocumentedUnknownType(
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