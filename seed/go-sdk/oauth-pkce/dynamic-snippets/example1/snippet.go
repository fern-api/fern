package example

import (
    context "context"

    fern "github.com/oauth-pkce/fern"
    client "github.com/oauth-pkce/fern/client"
    option "github.com/oauth-pkce/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.AuthorizeRequest{
        ClientID: "client_id",
        RedirectURI: "redirect_uri",
        CodeChallenge: "code_challenge",
        CodeChallengeMethod: fern.String(
            "S256",
        ),
        Scope: fern.String(
            "scope",
        ),
        State: fern.String(
            "state",
        ),
    }
    client.Oauth.Authorize(
        context.TODO(),
        request,
    )
}
