package com.snippets;

import com.seed.path.parameters.SeedPathParametersClient;
import com.seed.path.parameters.resources.user.requests.SearchUsersRequest;

public class Example6 {
    public static void run() {
        SeedPathParametersClient client = SeedPathParametersClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().searchUsers(
            "user_id",
            SearchUsersRequest
                .builder()
                .limit(1)
                .build()
        );
    }
}