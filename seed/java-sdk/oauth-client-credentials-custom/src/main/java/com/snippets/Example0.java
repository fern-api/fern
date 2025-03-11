package com.snippets;

import com.seed.oauth.client.credentials.SeedOauthClientCredentialsClient;
import com.seed.oauth.client.credentials.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void run() {
        SeedOauthClientCredentialsClient client = SeedOauthClientCredentialsClient
            .builder()
            .clientId("<clientId>")
            .clientSecret("<clientSecret>")
            .url("https://api.fern.com")
            .build();

        client.auth().getTokenWithClientCredentials(
            GetTokenRequest
                .builder()
                .cid("cid")
                .csr("csr")
                .scp("scp")
                .entityId("entity_id")
                .scope("scope")
                .build()
        );
    }
}