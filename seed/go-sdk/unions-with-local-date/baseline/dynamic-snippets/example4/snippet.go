package example

import (
    context "context"

    client "github.com/unions-with-local-date/fern/client"
    option "github.com/unions-with-local-date/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Types.Get(
        context.TODO(),
        "datetime-example",
    )
}
