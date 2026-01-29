package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.RequiredAndOptionalRequest;

public class Example46 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlinedRequests()
                .postWithRequiredAndOptionalFields(RequiredAndOptionalRequest.builder()
                        .requiredString("<requiredString>")
                        .optionalString("optional_value")
                        .build());
    }
}
