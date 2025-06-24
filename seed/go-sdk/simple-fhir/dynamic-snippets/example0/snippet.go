package example

import (
    client "github.com/simple-fhir/fern/client"
    option "github.com/simple-fhir/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.GetAccount(
        context.TODO(),
        "account_id",
    )
}
