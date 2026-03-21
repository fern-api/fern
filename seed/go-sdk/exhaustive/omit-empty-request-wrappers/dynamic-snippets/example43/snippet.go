package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    fern "github.com/exhaustive/fern"
    context "context"
)

func do() {
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
    client.Endpoints.Primitive.GetAndReturnDatetime(
        context.TODO(),
        request,
    )
}
