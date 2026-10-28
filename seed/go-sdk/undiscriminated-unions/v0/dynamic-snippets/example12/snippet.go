package example

import (
    context "context"

    fern "github.com/undiscriminated-unions/fern"
    client "github.com/undiscriminated-unions/fern/client"
    option "github.com/undiscriminated-unions/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.PaymentRequest{
        PaymentMethod: &fern.PaymentMethodUnion{
            TokenizeCard: &fern.TokenizeCard{
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
