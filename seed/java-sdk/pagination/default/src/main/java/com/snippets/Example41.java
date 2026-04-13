package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithOffsetStepPaginationRequest;
import com.seed.api.types.Order;

public class Example41 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithoffsetsteppagination(UsersListWithOffsetStepPaginationRequest.builder()
                        .page(1)
                        .limit(1)
                        .order(Order.ASC)
                        .build());
    }
}
