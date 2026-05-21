package example

import (
    context "context"

    fern "github.com/cli-multi-spec/fern"
    client "github.com/cli-multi-spec/fern/client"
    option "github.com/cli-multi-spec/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetInvoiceRequest{
        InvoiceID: "invoiceId",
    }
    client.GetInvoice(
        context.TODO(),
        request,
    )
}
