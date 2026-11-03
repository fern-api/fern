package example

import (
    context "context"

    fern "github.com/bytes-upload/fern"
    client "github.com/bytes-upload/fern/client"
    option "github.com/bytes-upload/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UploadWithQueryParamsRequest{
        Model: "nova-2",
        Body: []byte(""),
    }
    err := client.Service.UploadWithQueryParams(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
