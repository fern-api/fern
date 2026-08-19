package example

import (
    context "context"

    client "github.com/mixed-case/fern/client"
    option "github.com/mixed-case/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.GetResource(
        context.TODO(),
        "ResourceID",
    )
}
