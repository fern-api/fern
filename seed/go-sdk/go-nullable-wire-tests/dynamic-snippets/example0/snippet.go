package example

import (
    context "context"

    client "github.com/go-nullable-wire-tests/fern/client"
    option "github.com/go-nullable-wire-tests/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Things.GetThing(
        context.TODO(),
    )
}
