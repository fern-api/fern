package com.snippets;

import com.seed.javaInferredAuthRefreshToken.SeedJavaInferredAuthRefreshTokenClient;
import com.seed.javaInferredAuthRefreshToken.resources.auth.requests.GetTokenRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedJavaInferredAuthRefreshTokenClient client = SeedJavaInferredAuthRefreshTokenClient.builder()
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getTokenWithRefreshToken(GetTokenRequest.builder()
                        .refreshToken("refresh_token")
                        .grantType("grant_type")
                        .scope("scope")
                        .code("code")
                        .codeVerifier("code_verifier")
                        .redirectUri("redirect_uri")
                        .build());
    }
}
