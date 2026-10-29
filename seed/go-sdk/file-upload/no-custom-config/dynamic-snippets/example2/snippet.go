package example

import (
    context "context"
    strings "strings"

    fern "github.com/file-upload/fern"
    client "github.com/file-upload/fern/client"
    option "github.com/file-upload/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.WithRefBodyRequest{
        ImageFile: strings.NewReader(
            "",
        ),
        Request: &fern.MyObject{
            Foo: "bar",
        },
    }
    _, err := client.Service.WithRefBody(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
