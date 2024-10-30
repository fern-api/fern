package example

import (
    client "github.com/enum/fern/client"
    context "context"
    fern "github.com/enum/fern"
)

func do() () {
    client := client.NewClient()
    client.PathParam.Send(
        context.TODO(),
        fern.OperandGreaterThan,
        &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    )
}
