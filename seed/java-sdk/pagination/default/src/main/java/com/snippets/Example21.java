package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersOffsetStepPaginationRequest;
import com.seed.pagination.resources.users.types.Order;

public class Example21 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.users().listWithOffsetStepPagination(
            ListUsersOffsetStepPaginationRequest
                .builder()
                .page(1)
                .limit(1)
                .order(Order.ASC)
                .build()
        );
    }
}