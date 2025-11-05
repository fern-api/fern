package example

import (
    client "github.com/variables/fern/client"
    option "github.com/variables/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.Post(
        context.TODO(),
    )
}
