package example

import (
    client "github.com/bytes-upload/fern/client"
    option "github.com/bytes-upload/fern/option"
    fern "github.com/bytes-upload/fern"
    bytes "bytes"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UploadWithQueryParamsRequest{
        Model: "nova-2",
        Body: bytes.NewReader(
            []byte(""),
        ),
    }
    client.Service.UploadWithQueryParams(
        context.TODO(),
        request,
    )
}
