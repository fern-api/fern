package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.StreamRequest;

public class Example10 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.streamDataContextWithEnvelopeSchema(StreamRequest.builder().build());
    }
}
