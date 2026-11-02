package example

import (
    context "context"

    undiscriminated "github.com/fern-api/undiscriminated-go"
    client "github.com/fern-api/undiscriminated-go/client"
    option "github.com/fern-api/undiscriminated-go/option"
)

func do() error {
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
    _, err := client.Union.TestCamelCaseProperties(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
