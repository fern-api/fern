package example

import (
    context "context"

    unions "github.com/fern-api/unions-go"
    client "github.com/fern-api/unions-go/client"
    option "github.com/fern-api/unions-go/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &unions.Shape{
        Circle: &unions.Circle{
            Radius: 1.1,
        },
        ID: "id",
    }
    _, err := client.Union.Update(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
