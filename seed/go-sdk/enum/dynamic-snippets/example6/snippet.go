package example

import (
    client "github.com/enum/fern/client"
    context "context"
    fern "github.com/enum/fern"
)

func do() () {
    client := client.NewClient()
    client.QueryParam.SendList(
        context.TODO(),
        &fern.SendEnumListAsQueryParamRequest{
            Operand: []fern.Operand{
                fern.OperandGreaterThan,
            },
            MaybeOperand: []*fern.Operand{
                fern.OperandGreaterThan.Ptr(),
            },
            OperandOrColor: []*fern.ColorOrOperand{
                &fern.ColorOrOperand{
                    Color: fern.ColorRed,
                },
            },
            MaybeOperandOrColor: []*fern.ColorOrOperand{},
        },
    )
}
