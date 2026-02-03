package com.snippets;

import com.seed.oauthClientCredentialsEnvironmentVariables.SeedOauthClientCredentialsEnvironmentVariablesClient;
import com.seed.oauthClientCredentialsEnvironmentVariables.resources.auth.requests.RefreshTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsEnvironmentVariablesClient client =
                SeedOauthClientCredentialsEnvironmentVariablesClient.builder()
                        .clientId("<clientId>")
                        .clientSecret("<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.auth()
                .refreshToken(RefreshTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .refreshToken("refresh_token")
                        .scope("scope")
                        .build());
    }
}
