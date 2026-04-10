package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.organizations.requests.OrganizationsGetOrganizationRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.organizations()
                .getorganization(
                        "tenant_id",
                        "organization_id",
                        OrganizationsGetOrganizationRequest.builder().build());
    }
}
