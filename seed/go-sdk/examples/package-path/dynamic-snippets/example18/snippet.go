package example

import (
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
    pleaseinhere "github.com/examples/fern/pleaseinhere"
    context "context"
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
    request := &pleaseinhere.GetMetadataRequest{
        Shallow: pleaseinhere.Bool(
            true,
        ),
        Tag: []*string{
            pleaseinhere.String(
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
