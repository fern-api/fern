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
    request := &fern.OptionalArgsRequest{
        ImageFile: strings.NewReader(
            "",
        ),
    }
    _, err := client.Service.OptionalArgs(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
