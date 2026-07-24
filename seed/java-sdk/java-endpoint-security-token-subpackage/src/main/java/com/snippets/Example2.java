package com.snippets;

import com.seed.javaEndpointSecurityTokenSubpackage.SeedJavaEndpointSecurityTokenSubpackageClient;

public class Example2 {
    public static void main(String[] args) {
        SeedJavaEndpointSecurityTokenSubpackageClient client = SeedJavaEndpointSecurityTokenSubpackageClient.builder()
                .apiKey("<value>")
                .url("https://api.fern.com")
                .build();

        client.user().getWithApiKeyOrOAuth();
    }
}
