package example

import (
    context "context"

    fern "github.com/go-date-containers/fern"
    client "github.com/go-date-containers/fern/client"
    option "github.com/go-date-containers/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListLoansByTimestampRequest{
        AsOf: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
    }
    client.Loans.ListLoansByTimestamp(
        context.TODO(),
        request,
    )
}
