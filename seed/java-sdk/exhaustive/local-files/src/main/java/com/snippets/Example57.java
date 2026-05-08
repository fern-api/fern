package com.snippets;

import com.fern.sdk.SeedApiClient;
import java.util.HashMap;

public class Example57 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnMapOfDocumentedUnknownType(
            new HashMap<String, Object>()
        );
    }
}