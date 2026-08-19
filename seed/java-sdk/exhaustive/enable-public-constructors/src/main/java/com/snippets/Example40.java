package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.endpoints.params.requests.ModifyResourceAtInlinedPath;

public class Example40 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .modifyWithInlinePath(ModifyResourceAtInlinedPath.builder()
                        .param("param")
                        .body("string")
                        .build());
    }
}
