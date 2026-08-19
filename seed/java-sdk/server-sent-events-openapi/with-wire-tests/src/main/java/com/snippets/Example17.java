package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.StreamXFernStreamingConditionRequest;

public class Example17 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.streamXFernStreamingCondition(
                StreamXFernStreamingConditionRequest.builder().query("query").build());
    }
}
