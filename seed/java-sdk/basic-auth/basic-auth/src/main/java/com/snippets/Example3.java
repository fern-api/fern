package com.snippets;

import com.seed.basicAuth.SeedBasicAuthClient;
import java.util.HashMap;

public class Example3 {
    public static void main(String[] args) {
        SeedBasicAuthClient client = SeedBasicAuthClient.builder()
                .credentials("<username>", "<password>")
                .url("https://api.fern.com")
                .build();

        client.basicAuth().postWithBasicAuth(new HashMap<String, Object>() {
            {
                put("key", "value");
            }
        });
    }
}
