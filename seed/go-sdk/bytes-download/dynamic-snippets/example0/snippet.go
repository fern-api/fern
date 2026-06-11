package example

import (
    context "context"

    client "github.com/bytes-download/fern/client"
    option "github.com/bytes-download/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.Simple(
        context.TODO(),
    )
}
