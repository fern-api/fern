package example

import (
    context "context"

    fern "github.com/mixed-case/fern"
    client "github.com/mixed-case/fern/client"
    option "github.com/mixed-case/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ServiceGetResourceRequest{
        ResourceID: "ResourceID",
    }
    client.Service.Getresource(
        context.TODO(),
        request,
    )
}
