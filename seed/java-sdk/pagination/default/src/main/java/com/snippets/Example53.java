package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithGlobalConfigRequest;

public class Example53 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithglobalconfig(
                        UsersListWithGlobalConfigRequest.builder().offset(1).build());
    }
}
