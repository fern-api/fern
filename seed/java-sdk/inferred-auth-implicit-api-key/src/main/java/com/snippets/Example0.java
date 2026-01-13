package com.snippets;

import com.seed.inferredAuthImplicitApiKey.SeedInferredAuthImplicitApiKeyClient;
import com.seed.inferredAuthImplicitApiKey.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitApiKeyClient client = SeedInferredAuthImplicitApiKeyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.auth().getToken(
            GetTokenRequest
                .builder()
                .apiKey("api_key")
                .build()
        );
    }
}