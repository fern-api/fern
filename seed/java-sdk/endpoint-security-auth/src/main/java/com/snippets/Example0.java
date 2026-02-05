package com.snippets;

import com.seed.endpointSecurityAuth.SeedEndpointSecurityAuthClient;
import com.seed.endpointSecurityAuth.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedEndpointSecurityAuthClient client = SeedEndpointSecurityAuthClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .build());
    }
}
