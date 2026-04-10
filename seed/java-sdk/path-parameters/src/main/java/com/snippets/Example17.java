package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.UserGetUserSpecificsRequest;

public class Example17 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.user()
                .getuserspecifics(
                        "tenant_id",
                        "user_id",
                        1,
                        "thought",
                        UserGetUserSpecificsRequest.builder().build());
    }
}
