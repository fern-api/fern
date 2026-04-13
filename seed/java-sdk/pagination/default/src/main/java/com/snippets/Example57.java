package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithAliasedDataRequest;

public class Example57 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithaliaseddata(UsersListWithAliasedDataRequest.builder()
                        .page(1)
                        .perPage(1)
                        .startingAfter("starting_after")
                        .build());
    }
}
