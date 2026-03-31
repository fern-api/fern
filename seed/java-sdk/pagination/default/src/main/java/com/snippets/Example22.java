package com.snippets;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListWithOffsetPaginationHasNextPageRequest;
import com.seed.pagination.resources.users.types.Order;

public class Example22 {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listWithOffsetPaginationHasNextPage(ListWithOffsetPaginationHasNextPageRequest.builder()
                        .page(1)
                        .limit(3)
                        .order(Order.ASC)
                        .build());
    }
}
