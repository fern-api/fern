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
            ID: "id",
            CreatedAt: fern.String(
                "createdAt",
            ),
            Radius: 1.1,
        },
        ID: "id",
        CreatedAt: fern.String(
            "createdAt",
        ),
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
