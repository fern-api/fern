package example

import (
    client "github.com/unions-with-local-date/fern/client"
    option "github.com/unions-with-local-date/fern/option"
    fern "github.com/unions-with-local-date/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Shape{
        Circle: &fern.Circle{
            Radius: 1.1,
        },
        Id: "id",
    }
    client.Union.Update(
        context.TODO(),
        request,
    )
}
