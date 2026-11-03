package example

import (
    context "context"

    fern "github.com/oauth-pkce/fern"
    client "github.com/oauth-pkce/fern/client"
    option "github.com/oauth-pkce/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.AuthorizeRequest{
        ClientID: "client_abc123",
        RedirectURI: "https://example.com/callback",
        CodeChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
        CodeChallengeMethod: fern.String(
            "S256",
        ),
        Scope: fern.String(
            "read write",
        ),
        State: fern.String(
            "xyz",
        ),
    }
    _, err := client.Oauth.Authorize(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
