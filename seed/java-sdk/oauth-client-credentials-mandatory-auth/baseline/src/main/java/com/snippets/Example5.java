package com.snippets;

import com.seed.oauthClientCredentialsMandatoryAuth.SeedOauthClientCredentialsMandatoryAuthClient;

public class Example5 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsMandatoryAuthClient client =
                SeedOauthClientCredentialsMandatoryAuthClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .build();

        client.simple().getSomething();
    }
}
