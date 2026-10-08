package com.snippets;

import com.seed.javaInferredAuthRefreshToken.SeedJavaInferredAuthRefreshTokenClient;
import com.seed.javaInferredAuthRefreshToken.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaInferredAuthRefreshTokenClient client = SeedJavaInferredAuthRefreshTokenClient.builder()
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getTokenWithRefreshToken(GetTokenRequest.builder()
                        .refreshToken("my-refresh-token")
                        .grantType("refresh_token")
                        .scope("read")
                        .build());
    }
}
