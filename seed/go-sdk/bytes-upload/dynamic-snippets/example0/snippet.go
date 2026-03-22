package example

import (
    bytes "bytes"
    context "context"
    client "github.com/bytes-upload/fern/client"
    option "github.com/bytes-upload/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := bytes.NewReader(
        []byte(""),
    )
    client.Service.Upload(
        context.TODO(),
        request,
    )
}
