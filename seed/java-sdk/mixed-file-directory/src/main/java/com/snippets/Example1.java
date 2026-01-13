package com.snippets;

import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;
import com.seed.mixedFileDirectory.resources.user.requests.ListUsersRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().list(
            ListUsersRequest
                .builder()
                .limit(1)
                .build()
        );
    }
}