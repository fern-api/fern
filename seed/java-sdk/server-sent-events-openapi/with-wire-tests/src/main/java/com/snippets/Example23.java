package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.SharedCompletionRequest;

public class Example23 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.validateCompletion(SharedCompletionRequest.builder().prompt("prompt").model("model").stream(true)
                .build());
    }
}
