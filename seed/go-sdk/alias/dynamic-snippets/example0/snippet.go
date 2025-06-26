package example

import (
    client "github.com/alias/fern/client"
    option "github.com/alias/fern/option"
    context "context"
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
