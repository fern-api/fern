package com.snippets;

import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;
import com.seed.mixedFileDirectory.resources.organization.types.CreateOrganizationRequest;

public class Example0 {
    public static void run() {
        SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.organization().create(
            CreateOrganizationRequest
                .builder()
                .name("name")
                .build()
        );
    }
}