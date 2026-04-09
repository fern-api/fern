package com.snippets;

import com.seed.basicAuthPwOmitted.SeedBasicAuthPwOmittedClient;
import java.util.HashMap;

public class Example5 {
    public static void main(String[] args) {
        SeedBasicAuthPwOmittedClient client = SeedBasicAuthPwOmittedClient.builder()
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
