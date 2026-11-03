package example

import (
    context "context"

    fern "github.com/package-yml/fern"
    client "github.com/package-yml/fern/client"
    option "github.com/package-yml/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.EchoRequest{
        Name: "name",
        Size: 1,
    }
    _, err := client.Echo(
        context.TODO(),
        "id",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
