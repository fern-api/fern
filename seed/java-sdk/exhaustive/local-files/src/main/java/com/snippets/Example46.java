package com.snippets;

import com.fern.sdk.SeedApiClient;
import java.util.HashMap;

public class Example46 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnMapOfDocumentedUnknownType(
            new HashMap<String, Object>()
        );
    }
}