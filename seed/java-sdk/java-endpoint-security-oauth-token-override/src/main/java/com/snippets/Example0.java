package com.snippets;

import com.seed.javaEndpointSecurityOauthTokenOverride.SeedJavaEndpointSecurityOauthTokenOverrideClient;
import com.seed.javaEndpointSecurityOauthTokenOverride.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaEndpointSecurityOauthTokenOverrideClient client =
                SeedJavaEndpointSecurityOauthTokenOverrideClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .build());
    }
}
