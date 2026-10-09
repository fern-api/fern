package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import java.util.HashMap;

public class Example4 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().container().getAndReturnMapPrimToPrim(new HashMap<String, String>() {
            {
                put("string", "string");
            }
        });
    }
}
