package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.auth.requests.AuthRefreshTokenRequest;
import com.seed.api.resources.auth.types.AuthRefreshTokenRequestAudience;
import com.seed.api.resources.auth.types.AuthRefreshTokenRequestGrantType;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .url("https://api.fern.com")
                .apiKey("<X-Api-Key>")
                .build();

        client.auth()
                .refreshtoken(AuthRefreshTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .refreshToken("refresh_token")
                        .audience(AuthRefreshTokenRequestAudience.HTTPS_API_EXAMPLE_COM)
                        .grantType(AuthRefreshTokenRequestGrantType.REFRESH_TOKEN)
                        .scope("scope")
                        .build());
    }
}
