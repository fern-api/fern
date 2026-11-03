package example

import (
    context "context"

    fern "github.com/client-side-params/fern"
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.GetResourceRequest{
        IncludeMetadata: true,
        Format: "json",
    }
    _, err := client.Service.GetResource(
        context.TODO(),
        "resourceId",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
