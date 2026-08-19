package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.StreamXFernStreamingUnionStreamRequest;
import com.seed.api.types.UnionStreamMessageVariant;

public class Example24 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.streamXFernStreamingUnionStream(
                StreamXFernStreamingUnionStreamRequest.message(UnionStreamMessageVariant.builder()
                        .prompt("prompt")
                        .message("message")
                        .streamResponse(true)
                        .build()));
    }
}
