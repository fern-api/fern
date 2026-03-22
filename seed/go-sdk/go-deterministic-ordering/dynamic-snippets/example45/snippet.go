package example

import (
    context "context"
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
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
    request := "string"
    client.Endpoints.Primitive.GetAndReturnString(
        context.TODO(),
        request,
    )
}
