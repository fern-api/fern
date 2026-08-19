package example

import (
    context "context"

    client "github.com/variables/fern/client"
    option "github.com/variables/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.Post(
        context.TODO(),
        "<endpointParam>",
    )
}
