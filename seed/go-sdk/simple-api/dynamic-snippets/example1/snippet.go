package example

import (
    context "context"

    fern "github.com/simple-api/fern"
    client "github.com/simple-api/fern/client"
    option "github.com/simple-api/fern/option"
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
    request := &fern.UserGetRequest{
        ID: "id",
    }
    client.User.Get(
        context.TODO(),
        request,
    )
}
