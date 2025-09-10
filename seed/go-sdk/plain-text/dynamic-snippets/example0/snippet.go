package example

import (
    client "github.com/plain-text/fern/client"
    option "github.com/plain-text/fern/option"
    context "context"
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
