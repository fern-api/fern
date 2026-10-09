package com.snippets;

import com.seed.oauthPkce.SeedOauthPkceClient;
import com.seed.oauthPkce.resources.oauth.requests.AuthorizeRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedOauthPkceClient client =
                SeedOauthPkceClient.builder().url("https://api.fern.com").build();

        client.oauth()
                .authorize(AuthorizeRequest.builder()
                        .clientId("client_abc123")
                        .redirectUri("https://example.com/callback")
                        .codeChallenge("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM")
                        .codeChallengeMethod("S256")
                        .scope("read write")
                        .state("xyz")
                        .build());
    }
}
