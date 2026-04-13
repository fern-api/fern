package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithOffsetStepPaginationRequest;

public class Example40 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithoffsetsteppagination(
                        UsersListWithOffsetStepPaginationRequest.builder().build());
    }
}
