package com.snippets;

import com.seed.javaOauthTokenOptional.SeedJavaOauthTokenOptionalClient;
import com.seed.javaOauthTokenOptional.resources.auth.requests.CreateOauth2TokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedJavaOauthTokenOptionalClient client = SeedJavaOauthTokenOptionalClient.withCredentials(
                        "<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .createOauth2Token(CreateOauth2TokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .grantType("grant_type")
                        .build());
    }
}
