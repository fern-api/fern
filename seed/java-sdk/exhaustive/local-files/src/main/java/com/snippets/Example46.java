package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.inlinedrequests.requests.RequiredAndOptionalRequest;

public class Example46 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.inlinedRequests().postWithRequiredAndOptionalFields(
            RequiredAndOptionalRequest
                .builder()
                .optionalString("optional_value")
                .build()
        );
    }
}