package com.snippets;

import com.seed.multi.line.docs.SeedMultiLineDocsClient;
import com.seed.multi.line.docs.resources.user.requests.CreateUserRequest;

public class Example1 {
    public static void run() {
        SeedMultiLineDocsClient client = SeedMultiLineDocsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().createUser(
            CreateUserRequest
                .builder()
                .name("name")
                .age(1)
                .build()
        );
    }
}