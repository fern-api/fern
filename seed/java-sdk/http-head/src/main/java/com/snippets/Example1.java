package com.snippets;

import com.seed.httpHead.SeedHttpHeadClient;
import com.seed.httpHead.resources.user.requests.ListUsersRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedHttpHeadClient client = SeedHttpHeadClient
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