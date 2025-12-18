package com.snippets;

import com.seed.oauthClientCredentialsReference.SeedOauthClientCredentialsReferenceClient;
import com.seed.oauthClientCredentialsReference.resources.auth.types.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsReferenceClient client = SeedOauthClientCredentialsReferenceClient.withCredentials(
                        "<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .build());
    }
}
