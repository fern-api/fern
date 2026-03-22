package example

import (
    context "context"
    client "github.com/alias/fern/client"
    option "github.com/alias/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Get(
        context.TODO(),
        "typeId",
    )
}
