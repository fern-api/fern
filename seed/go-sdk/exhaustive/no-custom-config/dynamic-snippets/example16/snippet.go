package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    endpoints "github.com/exhaustive/fern/endpoints"
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
    request := &endpoints.CreateRequestC{
        Label: "label",
        Priority: 1,
    }
    client.Endpoints.DuplicateNamesC.Create(
        context.TODO(),
        request,
    )
}
