package example

import (
    client "github.com/file-upload/fern/client"
    option "github.com/file-upload/fern/option"
    fern "github.com/file-upload/fern"
    strings "strings"
    context "context"
)

func do() {
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
    client.Service.OptionalArgs(
        context.TODO(),
        request,
    )
}
