package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithCursorPaginationRequest;
import com.seed.api.types.Order;

public class Example27 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithcursorpagination(UsersListWithCursorPaginationRequest.builder()
                        .page(1)
                        .perPage(1)
                        .order(Order.ASC)
                        .startingAfter("starting_after")
                        .build());
    }
}
