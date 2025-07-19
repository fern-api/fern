package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsersOptionalNullableDoubleRequest;
import com.seed.pagination.resources.users.types.Order;

public class Example13 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.users().listWithOptionalNullableDouble(
            ListUsersOptionalNullableDoubleRequest
                .builder()
                .page(1.1)
                .perPage(1)
                .order(Order.ASC)
                .build()
        );
    }
}