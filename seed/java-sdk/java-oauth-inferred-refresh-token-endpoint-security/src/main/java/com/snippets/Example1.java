package com.snippets;

import com.seed.javaOauthInferredRefreshTokenEndpointSecurity.SeedJavaOauthInferredRefreshTokenEndpointSecurityClient;
import com.seed.javaOauthInferredRefreshTokenEndpointSecurity.resources.auth.requests.GetTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedJavaOauthInferredRefreshTokenEndpointSecurityClient client =
                SeedJavaOauthInferredRefreshTokenEndpointSecurityClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .grantType("grant_type")
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .refreshToken("refresh_token")
                        .scope("scope")
                        .build());
    }
}
