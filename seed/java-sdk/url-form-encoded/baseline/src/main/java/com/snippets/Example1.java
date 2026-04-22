package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.PostSubmitRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.submitFormData(
                PostSubmitRequest.builder().username("username").email("email").build());
    }
}
