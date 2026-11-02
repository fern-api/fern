package example

import (
    context "context"

    fern "github.com/api-wide-base-path-with-default/fern"
    client "github.com/api-wide-base-path-with-default/fern/client"
    option "github.com/api-wide-base-path-with-default/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Widget{
        Name: "name",
    }
    _, err := client.Widgets.Create(
        context.TODO(),
        "v1beta",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
