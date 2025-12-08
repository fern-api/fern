package com.snippets;

import com.seed.javaOauthStagedBuilder.SeedJavaOauthStagedBuilderClient;
import com.seed.javaOauthStagedBuilder.resources.auth.requests.GetTokenRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaOauthStagedBuilderClient client = SeedJavaOauthStagedBuilderClient.builder()
                .clientId("<clientId>")
                .clientSecret("<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.auth()
                .getToken(GetTokenRequest.builder()
                        .apiKey("apiKey")
                        .clientId("clientId")
                        .clientSecret("clientSecret")
                        .scope("scope")
                        .build());
    }
}
