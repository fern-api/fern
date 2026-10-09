package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.IdentifierUpdate;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.updateProfileIdentifier(
                "profile_123",
                "email",
                IdentifierUpdate.builder()
                        .idType("phone")
                        .oldValue("+13175556789")
                        .newValue("+13175556798")
                        .build());
    }
}
