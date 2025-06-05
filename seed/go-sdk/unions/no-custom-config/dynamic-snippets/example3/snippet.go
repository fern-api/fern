package example

import (
    client "github.com/unions/fern/client"
    option "github.com/unions/fern/option"
    context "context"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Union.Get(
        context.TODO(),
        "id",
    )
}
