package com.snippets;

import com.seed.oauthClientCredentials.SeedOauthClientCredentialsClient;

public class Example4 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsClient client = SeedOauthClientCredentialsClient
            .builder()
            .clientId("<clientId>")
            .clientSecret("<clientSecret>")
            .url("https://api.fern.com")
            .build();

        client.simple().getSomething();
    }
}