package com.snippets;

import com.seed.oauthClientCredentialsDefault.SeedOauthClientCredentialsDefaultClient;

public class Example2 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsDefaultClient client = SeedOauthClientCredentialsDefaultClient.withCredentials("<clientId>", "<clientSecret>")
            .url("https://api.fern.com")
            .build()
        ;

        client.nested().api().getSomething();
    }
}