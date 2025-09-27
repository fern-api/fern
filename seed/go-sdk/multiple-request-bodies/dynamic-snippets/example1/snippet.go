package example

import (
    client "github.com/multiple-request-bodies/fern/client"
    option "github.com/multiple-request-bodies/fern/option"
    fern "github.com/multiple-request-bodies/fern"
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
    request := &fern.UploadDocumentRequest{
        Author: fern.String(
            "author",
        ),
        Tags: []string{
            "tags",
            "tags",
        },
        Title: fern.String(
            "title",
        ),
    }
    client.UploadJsonDocument(
        context.TODO(),
        request,
    )
}
