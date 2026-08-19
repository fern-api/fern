package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;
import com.seed.pathParameters.resources.user.requests.SearchUsersRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedPathParametersClient client = SeedPathParametersClient.builder()
                .url("https://api.fern.com")
                .tenantId("tenant_id")
                .build();

        client.user()
                .searchUsers("user_id", SearchUsersRequest.builder().limit(1).build());
    }
}
