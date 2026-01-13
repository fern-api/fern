package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;
import com.seed.pathParameters.resources.user.requests.GetUserMetadataRequest;

public class Example7 {
    public static void main(String[] args) {
        SeedPathParametersClient client = SeedPathParametersClient.builder()
                .url("https://api.fern.com")
                .tenantId("tenant_id")
                .build();

        client.user()
                .getUserMetadata("user_id", 1, GetUserMetadataRequest.builder().build());
    }
}
