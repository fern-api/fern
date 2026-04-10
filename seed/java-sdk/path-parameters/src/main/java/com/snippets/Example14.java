package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.UserGetUserMetadataRequest;

public class Example14 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.user()
                .getusermetadata(
                        "tenant_id",
                        "user_id",
                        1,
                        UserGetUserMetadataRequest.builder().build());
    }
}
