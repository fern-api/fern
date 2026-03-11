package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    endpoints "github.com/exhaustive/fern/endpoints"
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
    request := &endpoints.GetRequestB{
        Id: "id",
        Expand: fern.Bool(
            true,
        ),
    }
    client.Endpoints.DuplicateNamesB.Get(
        context.TODO(),
        request,
    )
}
