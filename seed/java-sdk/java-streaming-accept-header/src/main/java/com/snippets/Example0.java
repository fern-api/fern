package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.dummy.requests.DummyGenerateStreamRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.dummy()
                .generateStream(
                        DummyGenerateStreamRequest.builder().numEvents(1).build());
    }
}
