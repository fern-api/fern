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
    request := &fern.ListRequestA{
        Page: fern.Int(
            1,
        ),
        Limit: fern.Int(
            1,
        ),
    }
    client.Endpoints.DuplicateNamesA.List(
        context.TODO(),
        request,
    )
}
