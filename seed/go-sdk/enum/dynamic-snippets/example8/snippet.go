package example

import (
    context "context"

    fern "github.com/enum/fern"
    client "github.com/enum/fern/client"
    option "github.com/enum/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.QueryParamSendRequest{
        Operand: fern.OperandGreaterThan,
        MaybeOperand: fern.OperandGreaterThan.Ptr(),
        OperandOrColor: fern.ColorRed,
        MaybeOperandOrColor: &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    }
    client.Queryparam.Send(
        context.TODO(),
        request,
    )
}
