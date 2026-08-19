package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.StreamXFernStreamingUnionRequest;
import com.seed.api.types.UnionStreamMessageVariant;

public class Example27 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.streamXFernStreamingUnion(StreamXFernStreamingUnionRequest.message(UnionStreamMessageVariant.builder()
                .prompt("prompt")
                .message("message")
                .streamResponse(false)
                .build()));
    }
}
