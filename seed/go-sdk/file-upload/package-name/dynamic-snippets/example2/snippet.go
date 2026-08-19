package example

import (
    context "context"
    strings "strings"

    upload "github.com/fern-api/file-upload-go"
    client "github.com/fern-api/file-upload-go/client"
    option "github.com/fern-api/file-upload-go/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &upload.WithRefBodyRequest{
        ImageFile: strings.NewReader(
            "",
        ),
        Request: &upload.MyObject{
            Foo: "bar",
        },
    }
    client.Service.WithRefBody(
        context.TODO(),
        request,
    )
}
