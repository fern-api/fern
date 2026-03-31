package com.snippets;

import com.seed.basicAuthOptional.SeedBasicAuthOptionalClient;

public class Example2 {
    public static void main(String[] args) {
        SeedBasicAuthOptionalClient client = SeedBasicAuthOptionalClient.builder()
                .credentials("<username>", "<password>")
                .url("https://api.fern.com")
                .build();

        client.basicAuth().getWithBasicAuth();
    }
}
