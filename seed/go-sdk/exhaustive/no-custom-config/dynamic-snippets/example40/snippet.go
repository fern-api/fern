package example

import (
    context "context"
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
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
    request := int64(1000000)
    client.Endpoints.Primitive.GetAndReturnLong(
        context.TODO(),
        request,
    )
}
