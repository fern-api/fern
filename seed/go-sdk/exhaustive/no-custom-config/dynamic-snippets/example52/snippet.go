package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
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
    request := fern.MustParseDateTime(
        "2024-01-15T09:30:00Z",
    )
    _, err := client.Endpoints.Primitive.GetAndReturnDatetime(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
