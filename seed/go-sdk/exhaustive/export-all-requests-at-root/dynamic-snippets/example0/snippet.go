package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
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
    request := []string{
        "string",
        "string",
    }
    client.Endpoints.Container.GetAndReturnListOfPrimitives(
        context.TODO(),
        request,
    )
}
