package example

import (
    context "context"

    fern "github.com/enum/fern"
    client "github.com/enum/fern/client"
    option "github.com/enum/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SendEnumAsQueryParamRequest{
        Operand: fern.OperandGreaterThan,
        MaybeOperand: fern.OperandGreaterThan.Ptr(),
        OperandOrColor: &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
        MaybeOperandOrColor: &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    }
    err := client.QueryParam.Send(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
