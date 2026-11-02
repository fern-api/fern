package example

import (
    bytes "bytes"
    context "context"

    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
)

func do() error {
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
    _, err := client.Endpoints.Params.UploadWithPath(
        context.TODO(),
        "upload-path",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
