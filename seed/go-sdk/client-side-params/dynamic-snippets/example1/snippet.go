package example

import (
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
    context "context"
    fern "github.com/client-side-params/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.GetResource(
        context.TODO(),
        "resourceId",
        &fern.GetResourceRequest{
            IncludeMetadata: true,
            Format: "json",
        },
    )
}
