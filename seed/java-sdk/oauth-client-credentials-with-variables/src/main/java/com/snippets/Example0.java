package com.snippets;

import com.seed.oauthClientCredentialsWithVariables.SeedOauthClientCredentialsWithVariablesClient;
import com.seed.oauthClientCredentialsWithVariables.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsWithVariablesClient client = SeedOauthClientCredentialsWithVariablesClient.builder()
                .clientId("<clientId>")
                .clientSecret("<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getTokenWithClientCredentials(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .scope("scope")
                        .build());
    }
}
