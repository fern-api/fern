package com.snippets;

import com.seed.oauthClientCredentialsDefault.SeedOauthClientCredentialsDefaultClient;
import com.seed.oauthClientCredentialsDefault.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsDefaultClient client = SeedOauthClientCredentialsDefaultClient.builder()
                .clientId("<clientId>")
                .clientSecret("<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .build());
    }
}
