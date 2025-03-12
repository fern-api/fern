package com.snippets;

import com.seed.basicAuth.SeedBasicAuthClient;

public class Example0 {
    public static void run() {
        SeedBasicAuthClient client = SeedBasicAuthClient
            .builder()
            .credentials("<username>", "<password>")
            .url("https://api.fern.com")
            .build();

        client.basicAuth().getWithBasicAuth();
    }
}