package example

import (
    client "github.com/multiple-request-bodies/fern/client"
    option "github.com/multiple-request-bodies/fern/option"
    context "context"
    fern "github.com/multiple-request-bodies/fern"
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
    client.UploadJsonDocument(
        context.TODO(),
        &fern.UploadDocumentRequest{},
    )
}
