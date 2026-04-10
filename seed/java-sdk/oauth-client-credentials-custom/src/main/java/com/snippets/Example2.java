package com.snippets;

import com.seed.oauthClientCredentials.SeedOauthClientCredentialsClient;

public class Example2 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsClient client = SeedOauthClientCredentialsClient.withCredentials(
                        "<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.nestedNoAuth().api().getSomething();
    }
}
