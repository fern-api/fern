package com.snippets;

import com.seed.multiLineDocs.SeedMultiLineDocsClient;
import com.seed.multiLineDocs.resources.user.requests.CreateUserRequest;

public class Example1 {
    public static void main(String[] args) {
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