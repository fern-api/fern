package example

import (
    context "context"
    client "github.com/license/fern/client"
    option "github.com/license/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Get(
        context.TODO(),
    )
}
