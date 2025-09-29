package example

import (
    client "github.com/response-property/fern/client"
    option "github.com/response-property/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := "string"
    client.Service.GetMovie(
        context.TODO(),
        request,
    )
}
