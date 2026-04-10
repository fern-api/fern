package example

import (
    context "context"

    client "github.com/response-property/fern/client"
    option "github.com/response-property/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := "string"
    client.Service.GetMovieName(
        context.TODO(),
        request,
    )
}
