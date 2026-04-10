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
                        .cid("cid")
                        .csr("csr")
                        .scp("scp")
                        .entityId("entity_id")
                        .audience(AuthGetTokenWithClientCredentialsRequestAudience.HTTPS_API_EXAMPLE_COM)
                        .grantType(AuthGetTokenWithClientCredentialsRequestGrantType.CLIENT_CREDENTIALS)
                        .scope("scope")
                        .build());
    }
}
