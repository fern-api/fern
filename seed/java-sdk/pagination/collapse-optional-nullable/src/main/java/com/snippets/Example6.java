package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.inlineusers.inlineusers.requests.ListUsersBodyOffsetPaginationRequest;
import com.seed.pagination.resources.inlineusers.inlineusers.types.WithPage;

public class Example6 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsers()
                .inlineUsers()
                .listWithBodyOffsetPagination(ListUsersBodyOffsetPaginationRequest.builder()
                        .pagination(WithPage.builder().page(1).build())
                        .build());
    }
}
