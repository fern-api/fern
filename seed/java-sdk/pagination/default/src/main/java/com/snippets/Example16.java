package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersTopLevelBodyCursorPaginationRequest;

public class Example16 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listWithTopLevelBodyCursorPagination(ListUsersTopLevelBodyCursorPaginationRequest.builder()
                        .cursor("initial_cursor")
                        .filter("active")
                        .build());
    }
}
