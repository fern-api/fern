package com.snippets;

import com.seed.oauthClientCredentialsEnvironmentVariables.SeedOauthClientCredentialsEnvironmentVariablesClient;

public class Example4 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsEnvironmentVariablesClient client = SeedOauthClientCredentialsEnvironmentVariablesClient
            .builder()
            .clientId("<clientId>")
            .clientSecret("<clientSecret>")
            .url("https://api.fern.com")
            .build();

        client.simple().getSomething();
    }
}