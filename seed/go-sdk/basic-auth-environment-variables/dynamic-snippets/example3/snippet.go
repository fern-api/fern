package example

import (
    context "context"

    client "github.com/basic-auth-environment-variables/fern/client"
    option "github.com/basic-auth-environment-variables/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithBasicAuth(
            "YOUR_USERNAME",
            "YOUR_PASSWORD",
        ),
    )
    request := map[string]any{
        "key": "value",
    }
    _, err := client.BasicAuth.PostWithBasicAuth(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
