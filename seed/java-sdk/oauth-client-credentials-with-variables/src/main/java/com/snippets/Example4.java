package com.snippets;

import com.seed.oauthClientCredentialsWithVariables.SeedOauthClientCredentialsWithVariablesClient;

public class Example4 {
    public static void main(String[] args) {
        SeedOauthClientCredentialsWithVariablesClient client =
                SeedOauthClientCredentialsWithVariablesClient.withCredentials("<clientId>", "<clientSecret>")
                        .url("https://api.fern.com")
                        .rootVariable("YOUR_ROOT_VARIABLE")
                        .build();

        client.service().post();
    }
}
