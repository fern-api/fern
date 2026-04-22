package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersBodyOffsetPaginationRequest;
import com.seed.pagination.resources.users.types.WithPage;

public class Example20 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listWithBodyOffsetPagination(ListUsersBodyOffsetPaginationRequest.builder()
                        .pagination(WithPage.builder().page(1).build())
                        .build());
    }
}
