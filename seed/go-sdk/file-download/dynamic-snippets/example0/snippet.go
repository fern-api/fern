package example

import (
    context "context"
    client "github.com/file-download/fern/client"
    option "github.com/file-download/fern/option"
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
