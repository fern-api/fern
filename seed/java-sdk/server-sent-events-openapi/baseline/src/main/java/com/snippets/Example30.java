package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.StreamXFernStreamingNullableConditionStreamRequest;

public class Example30 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.streamXFernStreamingNullableConditionStream(StreamXFernStreamingNullableConditionStreamRequest.builder()
                .query("query")
                .build());
    }
}
