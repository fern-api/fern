package com.snippets;

import com.seed.api.SeedApiClient;
import java.util.HashMap;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.optional().sendoptionalbody(new HashMap<String, Object>() {
            {
                put("string", new HashMap<String, Object>() {
                    {
                        put("key", "value");
                    }
                });
            }
        });
    }
}
