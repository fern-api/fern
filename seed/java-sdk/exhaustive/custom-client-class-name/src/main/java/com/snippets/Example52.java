package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.oauth.requests.GetTokenRequest;

public class Example52 {
    public static void main(String[] args) {
        Best client = Best.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.oauth()
                .getToken(GetTokenRequest.builder()
                        .grantType("grant_type")
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .scope("scope")
                        .build());
    }
}
