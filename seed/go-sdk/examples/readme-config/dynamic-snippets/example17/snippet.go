package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    fern "github.com/examples/fern"
    context "context"
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
            false,
        ),
        Tag: []*string{
            fern.String(
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
