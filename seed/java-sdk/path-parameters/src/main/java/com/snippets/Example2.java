package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;
import com.seed.pathParameters.resources.organizations.requests.SearchOrganizationsRequest;

public class Example2 {
    public static void run() {
        SeedPathParametersClient client = SeedPathParametersClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.organizations().searchOrganizations(
            "organization_id",
            SearchOrganizationsRequest
                .builder()
                .limit(1)
                .build()
        );
    }
}