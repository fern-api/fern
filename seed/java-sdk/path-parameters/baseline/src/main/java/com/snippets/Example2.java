package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;
import com.seed.pathParameters.resources.organizations.requests.SearchOrganizationsRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedPathParametersClient client = SeedPathParametersClient.builder()
                .url("https://api.fern.com")
                .tenantId("tenant_id")
                .build();

        client.organizations()
                .searchOrganizations(
                        "organization_id",
                        SearchOrganizationsRequest.builder().limit(1).build());
    }
}
