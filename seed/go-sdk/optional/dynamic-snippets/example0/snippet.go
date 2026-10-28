package example

import (
    context "context"

    client "github.com/optional/fern/client"
    option "github.com/optional/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := map[string]any{
        "string": map[string]any{
            "key": "value",
        },
    }
    _, err := client.Optional.SendOptionalBody(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
