package com.snippets;

import com.seed.javaEndpointSecurityTokenSubpackage.SeedJavaEndpointSecurityTokenSubpackageClient;
import com.seed.javaEndpointSecurityTokenSubpackage.resources.token.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaEndpointSecurityTokenSubpackageClient client = SeedJavaEndpointSecurityTokenSubpackageClient.builder()
                .apiKey("<value>")
                .url("https://api.fern.com")
                .build();

        client.token()
                .getToken(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .build());
    }
}
