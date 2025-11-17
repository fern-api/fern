package com.snippets;

import com.seed.anyAuth.SeedAnyAuthClient;
import com.seed.anyAuth.resources.auth.requests.GetTokenRequest;
import com.seed.anyAuth.resources.auth.types.GrantType;

public class Example0 {
    public static void main(String[] args) {
        SeedAnyAuthClient client = SeedAnyAuthClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .grantType(GrantType.AUTHORIZATION_CODE)
                        .scope("scope")
                        .build());
    }
}
