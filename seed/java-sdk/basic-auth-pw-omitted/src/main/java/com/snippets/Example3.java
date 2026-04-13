package com.snippets;

import com.seed.api.SeedApiClient;
import java.util.HashMap;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .credentials("<username>", "<password>")
                .url("https://api.fern.com")
                .build();

        client.basicauth().postwithbasicauth(new HashMap<String, Object>() {
            {
                put("key", "value");
            }
        });
    }
}
