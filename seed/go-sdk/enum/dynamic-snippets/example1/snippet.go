package example

import (
    client "github.com/enum/fern/client"
    context "context"
    fern "github.com/enum/fern"
)

func do() () {
    client := client.NewClient()
    client.InlinedRequest.Send(
        context.TODO(),
        &fern.SendEnumInlinedRequest{
            Operand: fern.OperandGreaterThan,
            MaybeOperand: fern.OperandGreaterThan.Ptr(),
            OperandOrColor: &fern.ColorOrOperand{
                Color: fern.ColorRed,
            },
            MaybeOperandOrColor: &fern.ColorOrOperand{
                Color: fern.ColorRed,
            },
        },
    )
}
