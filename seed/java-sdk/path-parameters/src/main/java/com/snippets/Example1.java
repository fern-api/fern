package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;
import com.seed.pathParameters.resources.organizations.requests.GetOrganizationUserRequest;

public class Example1 {
    public static void run() {
        SeedPathParametersClient client = SeedPathParametersClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.organizations().getOrganizationUser(
            "organization_id",
            "user_id",
            GetOrganizationUserRequest
                .builder()
                .build()
        );
    }
}