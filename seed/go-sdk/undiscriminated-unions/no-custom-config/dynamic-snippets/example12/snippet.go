package example

import (
    context "context"

    undiscriminated "github.com/fern-api/undiscriminated-go"
    client "github.com/fern-api/undiscriminated-go/client"
    option "github.com/fern-api/undiscriminated-go/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &undiscriminated.UnionTestCamelCasePropertiesRequest{
        PaymentMethod: &undiscriminated.PaymentMethodUnion{
            TokenizeCard: &undiscriminated.TokenizeCard{
                Method: "method",
                CardNumber: "cardNumber",
            },
        },
    }
    client.Union.Testcamelcaseproperties(
        context.TODO(),
        request,
    )
}
