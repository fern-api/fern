package example

import (
    context "context"

    client "github.com/allof/fern/client"
    option "github.com/allof/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.GetEntity(
        context.TODO(),
    )
}
