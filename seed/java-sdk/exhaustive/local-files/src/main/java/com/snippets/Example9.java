package com.snippets;

import com.fern.sdk.SeedApiClient;
import java.util.HashMap;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsContainer().endpointsContainerGetAndReturnMapPrimToPrim(
            new HashMap<String, String>() {{
                put("string", "string");
            }}
        );
    }
}