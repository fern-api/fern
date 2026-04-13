package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.auth.requests.AuthGetTokenWithClientCredentialsRequest;
import com.seed.api.resources.auth.types.AuthGetTokenWithClientCredentialsRequestAudience;
import com.seed.api.resources.auth.types.AuthGetTokenWithClientCredentialsRequestGrantType;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .gettokenwithclientcredentials(AuthGetTokenWithClientCredentialsRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .audience(AuthGetTokenWithClientCredentialsRequestAudience.HTTPS_API_EXAMPLE_COM)
                        .grantType(AuthGetTokenWithClientCredentialsRequestGrantType.CLIENT_CREDENTIALS)
                        .scope("scope")
                        .build());
    }
}
