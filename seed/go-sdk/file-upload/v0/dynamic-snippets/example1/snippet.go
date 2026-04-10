package example

import (
    context "context"
    strings "strings"

    client "github.com/file-upload/fern/client"
    option "github.com/file-upload/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.Justfile(
        context.TODO(),
        strings.NewReader(
            "",
        ),
    )
}
