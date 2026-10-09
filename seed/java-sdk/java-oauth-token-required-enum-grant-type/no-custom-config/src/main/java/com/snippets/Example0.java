package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.authorization.requests.TokenRequest;
import com.seed.api.resources.authorization.types.TokenRequestGrantType;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.authorization()
                .createToken(TokenRequest.builder()
                        .grantType(TokenRequestGrantType.CLIENT_CREDENTIALS)
                        .build());
    }
}
