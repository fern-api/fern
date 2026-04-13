package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.auth.requests.AuthRefreshTokenRequest;
import com.seed.api.resources.auth.types.AuthRefreshTokenRequestAudience;
import com.seed.api.resources.auth.types.AuthRefreshTokenRequestGrantType;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .refreshtoken(AuthRefreshTokenRequest.builder()
                        .apiKey("X-Api-Key")
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .refreshToken("refresh_token")
                        .audience(AuthRefreshTokenRequestAudience.HTTPS_API_EXAMPLE_COM)
                        .grantType(AuthRefreshTokenRequestGrantType.REFRESH_TOKEN)
                        .build());
    }
}
