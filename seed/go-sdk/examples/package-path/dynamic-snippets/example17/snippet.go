package example

import (
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
    context "context"
    pleaseinhere "github.com/examples/fern/pleaseinhere"
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
    client.Service.GetMetadata(
        context.TODO(),
        &pleaseinhere.GetMetadataRequest{
            Shallow: pleaseinhere.Bool(
                false,
            ),
            Tag: []*string{
                pleaseinhere.String(
                    "development",
                ),
            },
            XApiVersion: "0.0.1",
        },
    )
}
