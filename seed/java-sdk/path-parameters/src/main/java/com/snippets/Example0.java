package com.snippets;

import com.seed.pathParameters.SeedPathParametersClient;

public class Example0 {
    public static void main(String[] args) {
        SeedPathParametersClient client = SeedPathParametersClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.organizations().getOrganization("tenant_id", "organization_id");
    }
}