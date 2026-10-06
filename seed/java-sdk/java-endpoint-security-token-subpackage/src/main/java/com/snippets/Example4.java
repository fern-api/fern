package com.snippets;

import com.seed.javaEndpointSecurityTokenSubpackage.SeedJavaEndpointSecurityTokenSubpackageClient;

public class Example4 {
    public static void main(String[] args) {
        SeedJavaEndpointSecurityTokenSubpackageClient client =
                SeedJavaEndpointSecurityTokenSubpackageClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.user().getWithBasic();
    }
}
