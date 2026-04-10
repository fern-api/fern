package example

import (
    bytes "bytes"
    context "context"

    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
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
    request := bytes.NewReader(
        []byte(""),
    )
    client.Endpoints.Params.UploadWithPath(
        context.TODO(),
        "upload-path",
        request,
    )
}
