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
            false,
        ),
        Tag: []*string{
            pleaseinhere.String(
                "development",
            ),
        },
        XApiVersion: "0.0.1",
    }
    client.Service.GetMetadata(
        context.TODO(),
        request,
    )
}
