package com.snippets;

import com.seed.javaOauthInferredRefreshTokenEndpointSecurity.SeedJavaOauthInferredRefreshTokenEndpointSecurityClient;
import com.seed.javaOauthInferredRefreshTokenEndpointSecurity.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaOauthInferredRefreshTokenEndpointSecurityClient client =
                SeedJavaOauthInferredRefreshTokenEndpointSecurityClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .grantType("refresh_token")
                        .refreshToken("my-refresh-token")
                        .build());
    }
}
