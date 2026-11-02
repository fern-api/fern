package example

import (
    context "context"

    fern "github.com/unions/fern"
    client "github.com/unions/fern/client"
    option "github.com/unions/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Shape{
        Circle: &fern.Circle{
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
