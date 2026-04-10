package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.auth.requests.RefreshTokenRequest;
import com.seed.api.resources.auth.types.RefreshTokenRequestAudience;
import com.seed.api.resources.auth.types.RefreshTokenRequestGrantType;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.auth()
                .refreshtoken(RefreshTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .refreshToken("refresh_token")
                        .audience(RefreshTokenRequestAudience.HTTPS_API_EXAMPLE_COM)
                        .grantType(RefreshTokenRequestGrantType.REFRESH_TOKEN)
                        .scope("scope")
                        .build());
    }
}
