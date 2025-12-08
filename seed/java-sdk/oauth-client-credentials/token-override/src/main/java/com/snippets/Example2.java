package com.snippets;

import com.seed.oauthClientCredentials.SeedOauthClientCredentialsClient;
import com.seed.oauthClientCredentials.resources.auth.requests.RefreshTokenRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsClient client = SeedOauthClientCredentialsClient.builder()
                .clientId("<clientId>")
                .clientSecret("<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .refreshToken(RefreshTokenRequest.builder()
                        .clientId("my_oauth_app_123")
                        .clientSecret("sk_live_abcdef123456789")
                        .refreshToken("refresh_token")
                        .scope("read:users")
                        .build());
    }
}
