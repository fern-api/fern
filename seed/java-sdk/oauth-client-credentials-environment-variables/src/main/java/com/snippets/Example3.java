package com.snippets;

import com.seed.oauthClientCredentialsEnvironmentVariables.SeedOauthClientCredentialsEnvironmentVariablesClient;

public class Example3 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsEnvironmentVariablesClient client = SeedOauthClientCredentialsEnvironmentVariablesClient
            .builder()
            .clientId("<clientId>")
            .clientSecret("<clientSecret>")
            .url("https://api.fern.com")
            .build();

        client.nested().api().getSomething();
    }
}