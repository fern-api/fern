package com.snippets;

import com.seed.path.parameters.SeedPathParametersClient;

public class Example0 {
    public static void run() {
        SeedPathParametersClient client = SeedPathParametersClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.organizations().getOrganization("tenant_id", "organization_id");
    }
}