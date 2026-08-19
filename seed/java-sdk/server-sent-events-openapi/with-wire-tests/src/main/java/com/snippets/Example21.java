package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.StreamXFernStreamingSharedSchemaRequest;

public class Example21 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.streamXFernStreamingSharedSchema(StreamXFernStreamingSharedSchemaRequest.builder()
                .prompt("prompt")
                .model("model")
                .build());
    }
}
