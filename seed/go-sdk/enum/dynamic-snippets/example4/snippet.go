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
    client.PathParam.Send(
        context.TODO(),
        fern.OperandGreaterThan,
        &fern.ColorOrOperand{
            Color: fern.ColorRed,
        },
    )
}
