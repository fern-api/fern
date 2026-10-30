package example

import (
    context "context"

    fern "github.com/validation/fern"
    client "github.com/validation/fern/client"
    option "github.com/validation/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateRequest{
        Decimal: 2.2,
        Even: 100,
        Name: "fern",
        Shape: fern.ShapeSquare,
    }
    _, err := client.Create(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
