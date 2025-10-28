package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import java.util.HashMap;

public class Example46 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.noAuth().postWithNoAuth(new HashMap<String, Object>() {
            {
                put("key", "value");
            }
        });
    }
}
