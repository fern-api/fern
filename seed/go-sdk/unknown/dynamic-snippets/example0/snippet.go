package example

import (
    context "context"

    client "github.com/unknown/fern/client"
    option "github.com/unknown/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := map[string]any{
        "key": "value",
    }
    _, err := client.Unknown.Post(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
