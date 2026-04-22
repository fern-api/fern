package example

import (
    context "context"

    fern "github.com/multiple-request-bodies/fern"
    client "github.com/multiple-request-bodies/fern/client"
    option "github.com/multiple-request-bodies/fern/option"
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
    request := &fern.UploadDocumentRequest{}
    client.UploadJSONDocument(
        context.TODO(),
        request,
    )
}
