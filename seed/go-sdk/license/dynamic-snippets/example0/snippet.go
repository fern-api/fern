package example

import (
    client "github.com/license/fern/client"
    option "github.com/license/fern/option"
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
    )
}
