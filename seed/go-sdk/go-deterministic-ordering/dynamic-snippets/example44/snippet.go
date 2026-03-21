package example

import (
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
    bytes "bytes"
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
    request := bytes.NewReader(
        []byte(""),
    )
    client.Endpoints.Params.UploadWithPath(
        context.TODO(),
        "upload-path",
        request,
    )
}
