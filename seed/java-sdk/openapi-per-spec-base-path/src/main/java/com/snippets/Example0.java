package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.oauth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.oauth()
                .getToken(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .build());
    }
}
