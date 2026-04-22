package example

import (
    context "context"

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
    client.User.Get(
        context.TODO(),
        "id",
    )
}
