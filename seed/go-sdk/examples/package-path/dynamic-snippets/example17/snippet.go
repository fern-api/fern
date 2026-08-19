package example

import (
    context "context"

    pleaseinhere "github.com/examples/fern/pleaseinhere"
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
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
        XAPIVersion: "0.0.1",
    }
    client.Service.GetMetadata(
        context.TODO(),
        request,
    )
}
