package example

import (
    context "context"

    fern "github.com/go-deterministic-ordering/fern"
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
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
    request := &fern.GetRequestC{
        ID: "id",
        Verbose: fern.Bool(
            true,
        ),
    }
    err := client.Endpoints.DuplicateNamesC.Get(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
