package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.endpoints.params.requests.ModifyResourceAtInlinedPath;

public class Example40 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().modifyWithInlinePath(
            ModifyResourceAtInlinedPath
                .builder()
                .param("param")
                .body("string")
                .build()
        );
    }
}