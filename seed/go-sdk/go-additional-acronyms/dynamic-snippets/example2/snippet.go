package example

import (
    context "context"

    fern "github.com/go-additional-acronyms/fern"
    client "github.com/go-additional-acronyms/fern/client"
    option "github.com/go-additional-acronyms/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CRAReportGetRequest{
        UserToken: "user_token",
    }
    client.CRAReport.Get(
        context.TODO(),
        request,
    )
}
