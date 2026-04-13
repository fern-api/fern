package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithExtendedResultsRequest;

public class Example45 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithextendedresults(UsersListWithExtendedResultsRequest.builder()
                        .cursor("cursor")
                        .build());
    }
}
