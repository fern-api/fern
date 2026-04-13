package example

import (
    context "context"

    fern "github.com/unions-with-local-date/fern"
    client "github.com/unions-with-local-date/fern/client"
    option "github.com/unions-with-local-date/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Shape{
        ShapeZero: &fern.ShapeZero{
            Radius: 1.1,
            Type: fern.ShapeZeroTypeCircle,
        },
    }
    client.Union.Update(
        context.TODO(),
        request,
    )
}
