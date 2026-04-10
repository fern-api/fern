package example

import (
    context "context"

    fern "github.com/client-side-params/fern"
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.ServiceGetResourceRequest{
        ResourceID: "resourceId",
        IncludeMetadata: true,
        Format: "format",
    }
    client.Service.Getresource(
        context.TODO(),
        request,
    )
}
