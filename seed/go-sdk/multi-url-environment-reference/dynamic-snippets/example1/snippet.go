package example

import (
    context "context"

    client "github.com/multi-url-environment-reference/fern/client"
    option "github.com/multi-url-environment-reference/fern/option"
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
    client.Items.ListItems(
        context.TODO(),
    )
}
