package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.StreamXFernStreamingSharedSchemaStreamRequest;

public class Example18 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.streamXFernStreamingSharedSchemaStream(StreamXFernStreamingSharedSchemaStreamRequest.builder()
                .prompt("prompt")
                .model("model")
                .build());
    }
}
