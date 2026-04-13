package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithCustomPagerRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithcustompager(UsersListWithCustomPagerRequest.builder().build());
    }
}
