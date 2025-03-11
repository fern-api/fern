package com.snippets;

import com.seed.path.parameters.SeedPathParametersClient;
import com.seed.path.parameters.resources.organizations.requests.GetOrganizationUserRequest;

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