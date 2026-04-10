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
    request := &fern.ServiceWithFormEncodedContainersRequest{
        File: strings.NewReader(
            "",
        ),
        FileList: strings.NewReader(
            "",
        ),
        MaybeFile: strings.NewReader(
            "",
        ),
        MaybeFileList: strings.NewReader(
            "",
        ),
    }
    client.Service.Withformencodedcontainers(
        context.TODO(),
        request,
    )
}
