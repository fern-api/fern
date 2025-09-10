package example

import (
    client "github.com/multi-url-environment-no-default/fern/client"
    option "github.com/multi-url-environment-no-default/fern/option"
    context "context"
    fern "github.com/multi-url-environment-no-default/fern"
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
    client.S3.GetPresignedUrl(
        context.TODO(),
        &fern.GetPresignedUrlRequest{
            S3Key: "s3Key",
        },
    )
}
