package example

import (
    context "context"

    client "github.com/schemaless-request-body-examples/fern/client"
    option "github.com/schemaless-request-body-examples/fern/option"
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
    _, err := client.CreatePlant(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
