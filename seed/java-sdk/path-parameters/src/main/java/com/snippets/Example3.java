package com.snippets;

import com.seed.path.parameters.SeedPathParametersClient;
import com.seed.path.parameters.resources.user.requests.GetUsersRequest;

public class Example3 {
    public static void run() {
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