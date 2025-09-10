package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    context "context"
    fern "github.com/examples/fern"
)

func do() {
    client := client.NewAcme(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.Service.GetMetadata(
        context.TODO(),
        &fern.GetMetadataRequest{
            Shallow: fern.Bool(
                true,
            ),
            Tag: []*string{
                fern.String(
                    "tag",
                ),
            },
            XApiVersion: "X-API-Version",
        },
    )
}
