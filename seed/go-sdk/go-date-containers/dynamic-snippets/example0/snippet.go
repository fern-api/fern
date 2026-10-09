package example

import (
    context "context"

    client "github.com/go-date-containers/fern/client"
    option "github.com/go-date-containers/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Loans.GetLoan(
        context.TODO(),
    )
}
