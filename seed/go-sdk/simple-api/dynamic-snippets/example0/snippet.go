package example

import (
    client "github.com/simple-api/fern/client"
    option "github.com/simple-api/fern/option"
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
    client.User.Get(
        context.TODO(),
        "id",
    )
}
