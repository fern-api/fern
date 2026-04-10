package com.snippets;

import com.seed.oauthClientCredentialsMandatoryAuth.SeedOauthClientCredentialsMandatoryAuthClient;

public class Example4 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsMandatoryAuthClient client =
                SeedOauthClientCredentialsMandatoryAuthClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.nested().api().getSomething();
    }
}
