package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithExtendedResultsAndOptionalDataRequest;

public class Example46 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithextendedresultsandoptionaldata(UsersListWithExtendedResultsAndOptionalDataRequest.builder()
                        .build());
    }
}
