package com.snippets;

import com.seed.api.SeedApiClient;
import java.util.HashMap;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.folder().service().unknownRequest(new HashMap<String, Object>() {
            {
                put("key", "value");
            }
        });
    }
}
