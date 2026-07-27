package com.snippets;

import com.seed.javaOauthTokenRequiredGrantType.SeedJavaOauthTokenRequiredGrantTypeClient;
import com.seed.javaOauthTokenRequiredGrantType.resources.auth.requests.GetTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedJavaOauthTokenRequiredGrantTypeClient client = SeedJavaOauthTokenRequiredGrantTypeClient.withCredentials(
                        "<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .grantType("grant_type")
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .build());
    }
}
