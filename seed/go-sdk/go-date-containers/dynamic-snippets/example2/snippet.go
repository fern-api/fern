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
    request := &fern.ListLoansByDateRequest{
        AsOf: fern.MustParseDate(
            "2023-01-15",
        ),
        Page: &fern.PageRequest{
            Number: fern.Int(
                1,
            ),
            Size: fern.Int(
                1,
            ),
        },
    }
    client.Loans.ListLoansByDate(
        context.TODO(),
        request,
    )
}
