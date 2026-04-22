package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersBodyCursorPaginationRequest;
import com.seed.pagination.resources.users.types.WithCursor;

public class Example15 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listWithBodyCursorPagination(ListUsersBodyCursorPaginationRequest.builder()
                        .pagination(WithCursor.builder().cursor("cursor").build())
                        .build());
    }
}
