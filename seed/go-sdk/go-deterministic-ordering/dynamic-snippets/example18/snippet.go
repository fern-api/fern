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
    request := &fern.ListRequestC{
        Offset: fern.Int(
            1,
        ),
        Count: fern.Int(
            1,
        ),
    }
    err := client.Endpoints.DuplicateNamesC.List(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
