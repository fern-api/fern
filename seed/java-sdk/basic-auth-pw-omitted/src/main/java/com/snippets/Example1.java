package com.snippets;

import com.seed.basicAuthPwOmitted.SeedBasicAuthPwOmittedClient;

public class Example1 {
    public static void main(String[] args) {
        SeedBasicAuthPwOmittedClient client = SeedBasicAuthPwOmittedClient.builder()
                .credentials("<username>", "<password>")
                .url("https://api.fern.com")
                .build();

        client.basicAuth().getWithBasicAuth();
    }
}
