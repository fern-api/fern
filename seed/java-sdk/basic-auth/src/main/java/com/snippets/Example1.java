package com.snippets;

import com.seed.basic.auth.SeedBasicAuthClient;
import java.util.HashMap;

public class Example1 {
    public static void run() {
        SeedBasicAuthClient client = SeedBasicAuthClient
            .builder()
            .username("<username>")
            .password("<password>")
            .url("https://api.fern.com")
            .build();

        client.basicAuth().postWithBasicAuth(new 
        HashMap<String, Object>() {{put("key", "value");
        }});
    }
}