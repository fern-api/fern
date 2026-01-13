package com.snippets;

import com.seed.multiLineDocs.SeedMultiLineDocsClient;

public class Example0 {
    public static void main(String[] args) {
        SeedMultiLineDocsClient client = SeedMultiLineDocsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().getUser("userId");
    }
}