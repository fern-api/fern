package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.UserSearchUsersRequest;

public class Example13 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.user()
                .searchusers(
                        "tenant_id",
                        "user_id",
                        UserSearchUsersRequest.builder().limit(1).build());
    }
}
