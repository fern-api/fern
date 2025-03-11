package com.snippets;

import com.seed.basic.auth.SeedBasicAuthClient;

public class Example0 {
    public static void run() {
        SeedBasicAuthClient client = SeedBasicAuthClient
            .builder()
            .username("<username>")
            .password("<password>")
            .url("https://api.fern.com")
            .build();

        client.basicAuth().getWithBasicAuth();
    }
}