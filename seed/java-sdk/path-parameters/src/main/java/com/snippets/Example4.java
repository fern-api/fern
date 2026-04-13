package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.organizations.requests.OrganizationsSearchOrganizationsRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.organizations()
                .searchorganizations(
                        "tenant_id",
                        "organization_id",
                        OrganizationsSearchOrganizationsRequest.builder().build());
    }
}
