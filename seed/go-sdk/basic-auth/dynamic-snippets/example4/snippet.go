package example

import (
    context "context"

    client "github.com/basic-auth/fern/client"
    option "github.com/basic-auth/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithBasicAuth(
            "<username>",
            "<password>",
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
