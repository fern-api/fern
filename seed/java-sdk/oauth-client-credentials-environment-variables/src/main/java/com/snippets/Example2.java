package com.snippets;

import com.seed.oauthClientCredentialsEnvironmentVariables.SeedOauthClientCredentialsEnvironmentVariablesClient;

public class Example2 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsEnvironmentVariablesClient client = SeedOauthClientCredentialsEnvironmentVariablesClient.withCredentials("<clientId>", "<clientSecret>")
            .url("https://api.fern.com")
            .build()
        ;

        client.nestedNoAuth().api().getSomething();
    }
}