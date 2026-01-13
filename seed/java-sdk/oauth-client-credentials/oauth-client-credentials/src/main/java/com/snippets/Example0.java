package com.snippets;

import com.seed.oauthClientCredentials.SeedOauthClientCredentialsClient;
import com.seed.oauthClientCredentials.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsClient client = SeedOauthClientCredentialsClient.withCredentials("<clientId>", "<clientSecret>")
            .url("https://api.fern.com")
            .build()
        ;

        client.auth().getTokenWithClientCredentials(
            GetTokenRequest
                .builder()
                .clientId("my_oauth_app_123")
                .clientSecret("sk_live_abcdef123456789")
                .scope("read:users")
                .build()
        );
    }
}