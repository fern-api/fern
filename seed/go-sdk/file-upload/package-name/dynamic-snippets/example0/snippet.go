package example

import (
    client "github.com/fern-api/file-upload-go/client"
    option "github.com/fern-api/file-upload-go/option"
    context "context"
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
