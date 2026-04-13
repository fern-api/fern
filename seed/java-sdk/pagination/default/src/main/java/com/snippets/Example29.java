package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithMixedTypeCursorPaginationRequest;

public class Example29 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithmixedtypecursorpagination(UsersListWithMixedTypeCursorPaginationRequest.builder()
                        .cursor("cursor")
                        .build());
    }
}
