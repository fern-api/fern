package example

import (
    context "context"

    client "github.com/bearer-token-environment-variable/fern/client"
    option "github.com/bearer-token-environment-variable/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithAPIKey(
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
