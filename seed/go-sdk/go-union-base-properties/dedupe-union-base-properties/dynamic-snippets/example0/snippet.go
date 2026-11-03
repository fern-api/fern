package example

import (
    context "context"

    fern "github.com/go-union-base-properties/fern"
    client "github.com/go-union-base-properties/fern/client"
    option "github.com/go-union-base-properties/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Shape{
        Circle: &fern.Circle{
            ID: "shape-1",
            CreatedAt: fern.String(
                "2024-01-01T00:00:00Z",
            ),
            Radius: 1.5,
        },
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
