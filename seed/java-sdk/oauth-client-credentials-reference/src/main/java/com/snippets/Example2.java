package com.snippets;

import com.seed.oauthClientCredentialsReference.SeedOauthClientCredentialsReferenceClient;

public class Example2 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsReferenceClient client = SeedOauthClientCredentialsReferenceClient.withCredentials(
                        "<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.simple().getSomething();
    }
}
