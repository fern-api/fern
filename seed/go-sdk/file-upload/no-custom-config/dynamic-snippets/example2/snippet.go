package example

import (
    context "context"
    strings "strings"

    fern "github.com/file-upload/fern"
    client "github.com/file-upload/fern/client"
    option "github.com/file-upload/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ServiceJustFileWithOptionalQueryParamsRequest{
        File: strings.NewReader(
            "",
        ),
    }
    client.Service.Justfilewithoptionalqueryparams(
        context.TODO(),
        request,
    )
}
