package example

import (
    context "context"

    client "github.com/simple-fhir/fern/client"
    option "github.com/simple-fhir/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.GetAccount(
        context.TODO(),
        "account_id",
    )
    if err != nil {
        return err
    }
    return nil
}
