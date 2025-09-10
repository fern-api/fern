package example

import (
    client "github.com/validation/fern/client"
    option "github.com/validation/fern/option"
    context "context"
    fern "github.com/validation/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Create(
        context.TODO(),
        &fern.CreateRequest{
            Decimal: 2.2,
            Even: 100,
            Name: "fern",
            Shape: fern.ShapeSquare,
        },
    )
}
