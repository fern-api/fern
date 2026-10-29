package example

import (
    context "context"

    client "github.com/header-auth/fern/client"
    option "github.com/header-auth/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithHeaderTokenAuth(
            "YOUR_API_KEY",
        ),
    )
    _, err := client.Service.GetWithBearerToken(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
