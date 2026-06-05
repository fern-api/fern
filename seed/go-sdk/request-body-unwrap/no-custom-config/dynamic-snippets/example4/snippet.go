package example

import (
    context "context"

    fern "github.com/request-body-unwrap/fern"
    client "github.com/request-body-unwrap/fern/client"
    option "github.com/request-body-unwrap/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateTransferRequest{
        Attributes: &fern.CreateTransferRequestAttributes{
            Amount: 1,
            SourceAccountID: "source_account_id",
            DestinationAccountID: "destination_account_id",
        },
    }
    client.Transfer.CreateTransfer(
        context.TODO(),
        request,
    )
}
