package com.snippets;

import com.seed.javaOauthTokenRequiredGrantType.SeedJavaOauthTokenRequiredGrantTypeClient;
import com.seed.javaOauthTokenRequiredGrantType.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaOauthTokenRequiredGrantTypeClient client = SeedJavaOauthTokenRequiredGrantTypeClient.withCredentials(
                        "<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .grantType("client_credentials")
                        .clientId("my_oauth_app_123")
                        .clientSecret("sk_live_abcdef123456789")
                        .build());
    }
}
