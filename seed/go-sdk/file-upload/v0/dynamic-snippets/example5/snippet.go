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
    request := &fern.ServiceWithFormEncodedContainersRequest{}
    client.Service.Withformencodedcontainers(
        context.TODO(),
        strings.NewReader(
            "",
        ),
        strings.NewReader(
            "",
        ),
        strings.NewReader(
            "",
        ),
        strings.NewReader(
            "",
        ),
        request,
    )
}
