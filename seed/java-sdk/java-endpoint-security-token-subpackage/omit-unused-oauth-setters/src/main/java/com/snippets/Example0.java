package com.snippets;

import com.seed.javaEndpointSecurityTokenSubpackage.SeedJavaEndpointSecurityTokenSubpackageClient;
import com.seed.javaEndpointSecurityTokenSubpackage.resources.token.requests.GetTokenRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaEndpointSecurityTokenSubpackageClient client =
                SeedJavaEndpointSecurityTokenSubpackageClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.token()
                .getToken(GetTokenRequest.builder()
                        .clientId("client_id")
                        .clientSecret("client_secret")
                        .state("state")
                        .permissions(Optional.of(Arrays.asList("permissions", "permissions")))
                        .build());
    }
}
