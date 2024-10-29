package example

import (
    client "github.com/multi-url-environment/fern/client"
    option "github.com/multi-url-environment/fern/option"
    context "context"
    fern "github.com/multi-url-environment/fern"
)

func do() () {
    client := client.NewClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.S3.GetPresignedUrl(
        context.TODO(),
        &fern.GetPresignedUrlRequest{
            S3Key: "s3Key",
        },
    )
}
