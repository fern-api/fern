package example

import (
    context "context"
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
    client.Service.JustFile(
        context.TODO(),
        strings.NewReader(
            "",
        ),
    )
}
