package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.auth.requests.GetTokenRequest;
import com.seed.api.resources.auth.types.GetTokenRequestAudience;
import com.seed.api.resources.auth.types.GetTokenRequestGrantType;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.auth()
                .gettokenwithclientcredentials(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .audience(GetTokenRequestAudience.HTTPS_API_EXAMPLE_COM)
                        .grantType(GetTokenRequestGrantType.CLIENT_CREDENTIALS)
                        .build());
    }
}
