package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.IdentifierUpdate;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.updateProfileIdentifier(
                "profileId",
                "idTypePathParam",
                IdentifierUpdate.builder()
                        .idType("idType")
                        .oldValue("oldValue")
                        .newValue("newValue")
                        .build());
    }
}
