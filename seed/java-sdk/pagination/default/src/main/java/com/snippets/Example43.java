package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithOffsetPaginationHasNextPageRequest;
import com.seed.api.types.Order;

public class Example43 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithoffsetpaginationhasnextpage(UsersListWithOffsetPaginationHasNextPageRequest.builder()
                        .page(1)
                        .limit(1)
                        .order(Order.ASC)
                        .build());
    }
}
