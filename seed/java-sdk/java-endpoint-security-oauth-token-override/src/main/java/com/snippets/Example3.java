package com.snippets;

import com.seed.javaEndpointSecurityOauthTokenOverride.SeedJavaEndpointSecurityOauthTokenOverrideClient;

public class Example3 {
    public static void main(String[] args) {
        SeedJavaEndpointSecurityOauthTokenOverrideClient client =
                SeedJavaEndpointSecurityOauthTokenOverrideClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.user().getWithAnyAuth();
    }
}
