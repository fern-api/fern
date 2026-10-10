package com.snippets;

import com.seed.javaOauthInferredRefreshTokenEndpointSecurity.SeedJavaOauthInferredRefreshTokenEndpointSecurityClient;

public class Example2 {
    public static void main(String[] args) {
        SeedJavaOauthInferredRefreshTokenEndpointSecurityClient client =
                SeedJavaOauthInferredRefreshTokenEndpointSecurityClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.simple().getSomething();
    }
}
