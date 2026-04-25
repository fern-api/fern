package com.snippets;

import com.seed.basicAuthPwOmitted.SeedBasicAuthPwOmittedClient;

public class Example2 {
    public static void main(String[] args) {
        SeedBasicAuthPwOmittedClient client = SeedBasicAuthPwOmittedClient.builder()
                .credentials("<username>")
                .url("https://api.fern.com")
                .build();

        client.basicAuth().getWithBasicAuth();
    }
}
