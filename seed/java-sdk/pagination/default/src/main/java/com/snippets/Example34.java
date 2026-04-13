package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithOffsetPaginationRequest;

public class Example34 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithoffsetpagination(
                        UsersListWithOffsetPaginationRequest.builder().build());
    }
}
