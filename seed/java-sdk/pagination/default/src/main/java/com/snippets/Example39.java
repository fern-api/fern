package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithBodyOffsetPaginationRequest;
import com.seed.api.types.WithPage;

public class Example39 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithbodyoffsetpagination(UsersListWithBodyOffsetPaginationRequest.builder()
                        .pagination(WithPage.builder().page(1).build())
                        .build());
    }
}
