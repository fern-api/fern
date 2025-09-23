package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;
import com.seed.pathParameters.resources.organizations.requests.GetOrganizationUserRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedPathParametersClient client = SeedPathParametersClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.organizations().getOrganizationUser(
            organizationId,
            userId,
            GetOrganizationUserRequest
                .builder()
                .build()
        );
    }
}