package example

import (
    bytes "bytes"
    context "context"

    client "github.com/bytes-upload/fern/client"
    option "github.com/bytes-upload/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := bytes.NewReader(
        []byte(""),
    )
    err := client.Service.Upload(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
