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
    client.Headers.Send(
        context.TODO(),
        &fern.SendEnumAsHeaderRequest{
            Operand: fern.OperandGreaterThan,
            MaybeOperand: fern.OperandGreaterThan.Ptr(),
            OperandOrColor: &fern.ColorOrOperand{
                Color: fern.ColorRed,
            },
        },
    )
}
