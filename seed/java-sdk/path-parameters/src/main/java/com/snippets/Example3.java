package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.organizations.requests.OrganizationsGetOrganizationUserRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.organizations()
                .getorganizationuser(
                        "tenant_id",
                        "organization_id",
                        "user_id",
                        OrganizationsGetOrganizationUserRequest.builder().build());
    }
}
