package example

import (
    client "github.com/bytes-upload/fern/client"
    option "github.com/bytes-upload/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.Upload(
        context.TODO(),
    )
}
