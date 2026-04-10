package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;

public class Example0 {
    public static void main(String[] args) {
        SeedPathParametersClient client = SeedPathParametersClient.builder()
                .url("https://api.fern.com")
                .tenantId("tenant_id")
                .build();

        client.organizations().getOrganization("organization_id");
    }
}
