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
    err := client.PathParam.Send(
        context.TODO(),
        fern.OperandGreaterThan.Ptr(),
        &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    )
    if err != nil {
        return err
    }
    return nil
}
