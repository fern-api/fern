package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithBodyCursorPaginationRequest;
import com.seed.api.types.WithCursor;

public class Example31 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithbodycursorpagination(UsersListWithBodyCursorPaginationRequest.builder()
                        .pagination(WithCursor.builder().cursor("cursor").build())
                        .build());
    }
}
