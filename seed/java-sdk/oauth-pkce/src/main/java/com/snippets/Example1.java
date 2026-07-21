package com.snippets;

import com.seed.oauthPkce.SeedOauthPkceClient;
import com.seed.oauthPkce.resources.oauth.requests.AuthorizeRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedOauthPkceClient client =
                SeedOauthPkceClient.builder().url("https://api.fern.com").build();

        client.oauth()
                .authorize(AuthorizeRequest.builder()
                        .clientId("client_id")
                        .redirectUri("redirect_uri")
                        .codeChallenge("code_challenge")
                        .codeChallengeMethod("S256")
                        .scope("scope")
                        .state("state")
                        .build());
    }
}
