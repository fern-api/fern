package com.snippets;

import com.seed.oauthClientCredentialsMandatoryAuth.SeedOauthClientCredentialsMandatoryAuthClient;
import com.seed.oauthClientCredentialsMandatoryAuth.resources.auth.requests.GetTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsMandatoryAuthClient client =
                SeedOauthClientCredentialsMandatoryAuthClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.auth()
                .getTokenWithClientCredentials(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .scope("scope")
                        .build());
    }
}
