package example

import (
    client "github.com/enum/fern/client"
    option "github.com/enum/fern/option"
    context "context"
    fern "github.com/enum/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.InlinedRequest.Send(
        context.TODO(),
        &fern.SendEnumInlinedRequest{
            Operand: fern.OperandGreaterThan,
            OperandOrColor: &fern.ColorOrOperand{
                Color: fern.ColorRed,
            },
        },
    )
}
