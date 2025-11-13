package com.snippets;

import com.seed.oauthClientCredentialsEnvironmentVariables.SeedOauthClientCredentialsEnvironmentVariablesClient;
import com.seed.oauthClientCredentialsEnvironmentVariables.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsEnvironmentVariablesClient client =
                SeedOauthClientCredentialsEnvironmentVariablesClient.builder()
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
