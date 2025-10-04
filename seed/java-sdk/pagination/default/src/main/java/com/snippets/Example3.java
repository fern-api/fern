package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.inlineusers.inlineusers.requests.ListUsersMixedTypeCursorPaginationRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsers()
                .inlineUsers()
                .listWithMixedTypeCursorPagination(
                        ListUsersMixedTypeCursorPaginationRequest.builder().build());
    }
}
