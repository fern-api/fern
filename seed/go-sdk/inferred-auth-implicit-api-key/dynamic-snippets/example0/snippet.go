package example

import (
    context "context"

    fern "github.com/inferred-auth-implicit-api-key/fern"
    client "github.com/inferred-auth-implicit-api-key/fern/client"
    option "github.com/inferred-auth-implicit-api-key/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithAPIKey(
            "X-Api-Key",
        ),
    )
    request := &fern.GetTokenRequest{
        APIKey: "api_key",
    }
    _, err := client.Auth.GetToken(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
