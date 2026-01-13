package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersMixedTypeCursorPaginationRequest;

public class Example15 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listWithMixedTypeCursorPagination(
                        ListUsersMixedTypeCursorPaginationRequest.builder().build());
    }
}
