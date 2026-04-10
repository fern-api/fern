package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.optional.requests.SendOptionalBodyRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.optional()
                .sendoptionaltypedbody(
                        SendOptionalBodyRequest.builder().message("message").build());
    }
}
