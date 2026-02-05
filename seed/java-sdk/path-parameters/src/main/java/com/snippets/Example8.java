package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;
import com.seed.pathParameters.resources.user.requests.GetUserSpecificsRequest;

public class Example8 {
    public static void main(String[] args) {
        SeedPathParametersClient client = SeedPathParametersClient.builder()
                .url("https://api.fern.com")
                .tenantId("tenant_id")
                .build();

        client.user()
                .getUserSpecifics(
                        "user_id",
                        1,
                        "thought",
                        GetUserSpecificsRequest.builder().build());
    }
}
