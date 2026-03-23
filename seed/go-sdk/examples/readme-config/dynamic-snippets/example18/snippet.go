package example

import (
    context "context"
    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() {
    client := client.New(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.GetMetadataRequest{
        Shallow: fern.Bool(
            true,
        ),
        Tag: []*string{
            fern.String(
                "tag",
            ),
        },
        XApiVersion: "X-API-Version",
    }
    client.Service.GetMetadata(
        context.TODO(),
        request,
    )
}
