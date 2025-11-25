package example

import (
    client "github.com/fern-api/undiscriminated-go/client"
    option "github.com/fern-api/undiscriminated-go/option"
    undiscriminated "github.com/fern-api/undiscriminated-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &undiscriminated.PaymentRequest{
        PaymentMethod: &undiscriminated.PaymentMethodUnion{
            TokenizeCard: &undiscriminated.TokenizeCard{
                Method: "card",
                CardNumber: "1234567890123456",
            },
        },
    }
    client.Union.TestCamelCaseProperties(
        context.TODO(),
        request,
    )
}
