package example

import (
    context "context"

    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := []string{
        "string",
        "string",
    }
    _, err := client.Endpoints.Container.GetAndReturnListOfPrimitives(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
