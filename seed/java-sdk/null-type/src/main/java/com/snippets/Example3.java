package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.GetUsersRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.users().get("id", GetUsersRequest.builder().build());
    }
}
