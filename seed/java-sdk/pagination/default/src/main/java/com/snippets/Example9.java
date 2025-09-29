package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.inlineusers.inlineusers.requests.ListUsersExtendedRequest;
import java.util.UUID;

public class Example9 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.inlineUsers().inlineUsers().listWithExtendedResults(
            ListUsersExtendedRequest
                .builder()
                .cursor(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                .build()
        );
    }
}