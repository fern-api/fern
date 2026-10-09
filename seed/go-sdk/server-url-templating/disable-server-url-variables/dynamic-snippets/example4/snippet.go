package example

import (
    context "context"

    fern "github.com/server-url-templating/fern"
    client "github.com/server-url-templating/fern/client"
    option "github.com/server-url-templating/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.TokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
    }
    client.GetToken(
        context.TODO(),
        request,
    )
}
