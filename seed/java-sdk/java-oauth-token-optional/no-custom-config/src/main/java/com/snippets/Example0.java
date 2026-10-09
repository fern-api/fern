package com.snippets;

import com.seed.javaOauthTokenOptional.SeedJavaOauthTokenOptionalClient;
import com.seed.javaOauthTokenOptional.resources.auth.requests.CreateOauth2TokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaOauthTokenOptionalClient client = SeedJavaOauthTokenOptionalClient.withCredentials(
                        "<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .createOauth2Token(CreateOauth2TokenRequest.builder()
                        .clientId("my_oauth_app_123")
                        .clientSecret("sk_live_abcdef123456789")
                        .grantType("client_credentials")
                        .build());
    }
}
