package com.snippets;

import com.seed.oauthClientCredentials.SeedOauthClientCredentialsClient;
import com.seed.oauthClientCredentials.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsClient client = SeedOauthClientCredentialsClient.builder()
                .clientId("<clientId>")
                .clientSecret("<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getTokenWithClientCredentials(GetTokenRequest.builder()
                        .cid("cid")
                        .csr("csr")
                        .scp("scp")
                        .entityId("entity_id")
                        .scope("scope")
                        .build());
    }
}
