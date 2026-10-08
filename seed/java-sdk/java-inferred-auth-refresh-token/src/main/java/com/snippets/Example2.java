package com.snippets;

import com.seed.javaInferredAuthRefreshToken.SeedJavaInferredAuthRefreshTokenClient;

public class Example2 {
    public static void main(String[] args) {
        SeedJavaInferredAuthRefreshTokenClient client = SeedJavaInferredAuthRefreshTokenClient.builder()
                .url("https://api.fern.com")
                .build();

        client.simple().getSomething();
    }
}
