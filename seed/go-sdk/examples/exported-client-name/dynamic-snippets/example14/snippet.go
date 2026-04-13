package example

import (
    context "context"

    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() {
    client := client.NewAcmeClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.ServiceGetMetadataRequest{
        Shallow: fern.Bool(
            true,
        ),
        Tag: []*string{
            fern.String(
                "tag",
            ),
        },
        APIVersion: "apiVersion",
    }
    client.Service.Getmetadata(
        context.TODO(),
        request,
    )
}
