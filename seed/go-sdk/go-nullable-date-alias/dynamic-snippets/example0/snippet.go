package example

import (
    context "context"

    fern "github.com/go-nullable-date-alias/fern"
    client "github.com/go-nullable-date-alias/fern/client"
    option "github.com/go-nullable-date-alias/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Report{
        ID: "id",
    }
    client.Reports.Create(
        context.TODO(),
        request,
    )
}
