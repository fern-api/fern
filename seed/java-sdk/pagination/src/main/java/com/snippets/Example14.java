package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersOptionalNullableIntegerRequest;
import com.seed.pagination.resources.users.types.Order;

public class Example14 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.users().listWithOptionalNullableInteger(
            ListUsersOptionalNullableIntegerRequest
                .builder()
                .page(1)
                .perPage(1)
                .order(Order.ASC)
                .build()
        );
    }
}