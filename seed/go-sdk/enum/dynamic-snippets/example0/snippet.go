package example

import (
    client "github.com/enum/fern/client"
    option "github.com/enum/fern/option"
    fern "github.com/enum/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SendEnumAsHeaderRequest{
        Operand: fern.OperandGreaterThan,
        MaybeOperand: fern.OperandGreaterThan.Ptr(),
        OperandOrColor: &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    }
    client.Headers.Send(
        context.TODO(),
        request,
    )
}
