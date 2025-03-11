package com.snippets;

import com.seed.multi.line.docs.SeedMultiLineDocsClient;

public class Example0 {
    public static void run() {
        SeedMultiLineDocsClient client = SeedMultiLineDocsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().getUser("userId");
    }
}