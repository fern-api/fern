package example

import (
    client "github.com/mixed-case/fern/client"
    option "github.com/mixed-case/fern/option"
    context "context"
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
