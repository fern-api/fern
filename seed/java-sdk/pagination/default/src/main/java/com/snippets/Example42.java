package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithOffsetPaginationHasNextPageRequest;

public class Example42 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithoffsetpaginationhasnextpage(UsersListWithOffsetPaginationHasNextPageRequest.builder()
                        .build());
    }
}
