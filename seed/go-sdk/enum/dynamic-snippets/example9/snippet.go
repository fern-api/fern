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
    request := &fern.QueryParamSendListRequest{
        Operand: []*fern.Operand{
            fern.OperandGreaterThan.Ptr(),
        },
        MaybeOperand: []*fern.Operand{
            fern.OperandGreaterThan.Ptr(),
        },
        OperandOrColor: []*fern.ColorOrOperand{
            &fern.ColorOrOperand{
                Color: fern.ColorRed,
            },
        },
        MaybeOperandOrColor: []*fern.ColorOrOperand{
            &fern.ColorOrOperand{
                Color: fern.ColorRed,
            },
        },
    }
    client.Queryparam.Sendlist(
        context.TODO(),
        request,
    )
}
