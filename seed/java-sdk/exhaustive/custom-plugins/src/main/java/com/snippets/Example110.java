package com.snippets;

import com.seed.api.SeedApiClient;
import java.util.HashMap;

public class Example110 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.noauth().postwithnoauth(new HashMap<String, Object>() {
            {
                put("key", "value");
            }
        });
    }
}
