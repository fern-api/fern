package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.inlineusers.inlineusers.requests.ListUsersBodyCursorPaginationRequest;
import com.seed.pagination.resources.inlineusers.inlineusers.types.WithCursor;

public class Example3 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsers()
                .inlineUsers()
                .listWithBodyCursorPagination(ListUsersBodyCursorPaginationRequest.builder()
                        .pagination(WithCursor.builder().cursor("cursor").build())
                        .build());
    }
}
