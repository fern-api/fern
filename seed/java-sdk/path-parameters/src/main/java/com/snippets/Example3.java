package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;
import com.seed.pathParameters.resources.user.requests.GetUsersRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedPathParametersClient client = SeedPathParametersClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().getUser(
            "user_id",
            GetUsersRequest
                .builder()
                .build()
        );
    }
}