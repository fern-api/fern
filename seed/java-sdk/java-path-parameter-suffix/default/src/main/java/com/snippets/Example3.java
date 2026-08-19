package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.UpdateMessageRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.updateMessage(
                "accountSid", "sid", UpdateMessageRequest.builder().body("body").build());
    }
}
