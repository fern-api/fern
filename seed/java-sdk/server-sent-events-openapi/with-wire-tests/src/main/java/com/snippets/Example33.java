package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.StreamXFernStreamingNullableConditionRequest;

public class Example33 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.streamXFernStreamingNullableCondition(StreamXFernStreamingNullableConditionRequest.builder()
                .query("query")
                .build());
    }
}
