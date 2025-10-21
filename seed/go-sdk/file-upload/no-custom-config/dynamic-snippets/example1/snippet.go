package example

import (
    client "github.com/file-upload/fern/client"
    option "github.com/file-upload/fern/option"
    fern "github.com/file-upload/fern"
    context "context"
    strings "strings"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.OptionalArgsRequest{}
    client.Service.OptionalArgs(
        context.TODO(),
        strings.NewReader(
            "",
        ),
        request,
    )
}
