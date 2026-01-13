package com.snippets;

import com.seed.javaDefaultTimeout.SeedJavaDefaultTimeoutClient;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaDefaultTimeoutClient client = SeedJavaDefaultTimeoutClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.getUser();
    }
}