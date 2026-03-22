package example

import (
    context "context"
    fern "github.com/file-upload/fern"
    client "github.com/file-upload/fern/client"
    option "github.com/file-upload/fern/option"
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
