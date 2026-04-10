package example

import (
    context "context"

    client "github.com/plain-text/fern/client"
    option "github.com/plain-text/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.GetText(
        context.TODO(),
    )
}
