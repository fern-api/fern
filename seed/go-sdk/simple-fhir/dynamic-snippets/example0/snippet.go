package example

import (
    client "github.com/simple-fhir/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.GetAccount(
        context.TODO(),
        "account_id",
    )
}
