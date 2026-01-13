package com.snippets;

import com.seed.inferredAuthImplicit.SeedInferredAuthImplicitClient;
import com.seed.inferredAuthImplicit.resources.auth.types.RefreshTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedInferredAuthImplicitClient client = SeedInferredAuthImplicitClient.builder()
                .url("https://api.fern.com")
                .build();

        client.auth()
                .refreshToken(RefreshTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .refreshToken("refresh_token")
                        .scope("scope")
                        .build());
    }
}
