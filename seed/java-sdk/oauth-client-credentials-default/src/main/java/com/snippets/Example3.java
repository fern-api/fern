package com.snippets;

import com.seed.oauthClientCredentialsDefault.SeedOauthClientCredentialsDefaultClient;

public class Example3 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsDefaultClient client = SeedOauthClientCredentialsDefaultClient
            .builder()
            .clientId("<clientId>")
            .clientSecret("<clientSecret>")
            .url("https://api.fern.com")
            .build();

        client.simple().getSomething();
    }
}