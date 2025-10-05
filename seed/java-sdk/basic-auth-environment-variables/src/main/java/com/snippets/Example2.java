package com.snippets;

import com.seed.basicAuthEnvironmentVariables.SeedBasicAuthEnvironmentVariablesClient;
import java.util.HashMap;

public class Example2 {
    public static void main(String[] args) {
        SeedBasicAuthEnvironmentVariablesClient client = SeedBasicAuthEnvironmentVariablesClient.builder()
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
