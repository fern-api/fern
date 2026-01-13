package com.snippets;

import com.seed.oauthClientCredentialsWithVariables.SeedOauthClientCredentialsWithVariablesClient;

public class Example2 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsWithVariablesClient client = SeedOauthClientCredentialsWithVariablesClient.withCredentials("<clientId>", "<clientSecret>")
            .url("https://api.fern.com")
            .build()
        ;

        client.nestedNoAuth().api().getSomething();
    }
}