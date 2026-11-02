package example

import (
    context "context"

    client "github.com/inferred-auth-implicit-reference/fern/client"
    option "github.com/inferred-auth-implicit-reference/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithClientID(
            "client_id",
        ),
        option.WithClientSecret(
            "client_secret",
        ),
    )
    err := client.Nested.API.GetSomething(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
