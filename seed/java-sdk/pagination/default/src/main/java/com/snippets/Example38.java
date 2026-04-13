package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithBodyOffsetPaginationRequest;

public class Example38 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithbodyoffsetpagination(
                        UsersListWithBodyOffsetPaginationRequest.builder().build());
    }
}
