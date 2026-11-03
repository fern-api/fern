package example

import (
    context "context"

    client "github.com/go-date-containers/fern/client"
    option "github.com/go-date-containers/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Loans.GetLoan(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
